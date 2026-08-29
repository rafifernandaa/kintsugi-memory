import speech from "@google-cloud/speech";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * ============================================================================
 * 🎙️ SPEECH SERVICE: GOOGLE CLOUD SPEECH-TO-TEXT & VERTEX AI / GEMINI MULTIMODAL AUDIO
 * ============================================================================
 */

let speechClient: speech.SpeechClient | null = null;
try {
  speechClient = new speech.SpeechClient();
} catch (err) {
  console.warn("[SpeechService] Google Cloud SpeechClient initialization notice:", (err as any)?.message || err);
}

export interface TranscribeOptions {
  audioBuffer: Buffer;
  mimeType: string;
  filename?: string;
  meetingTitle?: string;
  subjectHint?: string;
  geminiApiKey?: string;
  geminiModel?: string;
}

export interface TranscriptionResult {
  transcript: string;
  summary: string;
  keyInvariants: string[];
  examAlerts: string[];
  actionItems: string[];
  subject: string;
  engineUsed: "google-cloud-speech" | "gemini-multimodal-audio";
}

/**
 * Primary Transcriber: Uses Vertex AI / Gemini Multimodal Audio or Google Cloud Speech-to-Text
 */
export async function transcribeAudio(options: TranscribeOptions): Promise<TranscriptionResult> {
  const { audioBuffer, mimeType, filename, meetingTitle, subjectHint, geminiApiKey, geminiModel } = options;

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Audio payload is empty. Please record audio from your microphone or upload a valid audio file.");
  }

  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
  const modelName = geminiModel || process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "kintsugi-memory-service";
  const location = process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "global";

  // 1. Try Vertex AI / Gemini Multimodal Audio
  try {
    let ai: GoogleGenAI;
    if (process.env.USE_VERTEX_AI === "true" || !apiKey || apiKey.trim() === "") {
      ai = new GoogleGenAI({ vertexai: true, project: projectId, location });
    } else {
      ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    }
    const base64Data = audioBuffer.toString("base64");

    let normalizedMime = mimeType || "audio/webm";
    if (normalizedMime.includes("webm")) normalizedMime = "audio/webm";
    else if (normalizedMime.includes("wav")) normalizedMime = "audio/wav";
    else if (normalizedMime.includes("mp4") || normalizedMime.includes("m4a")) normalizedMime = "audio/mp4";
    else if (normalizedMime.includes("mp3") || normalizedMime.includes("mpeg")) normalizedMime = "audio/mp3";
    else if (normalizedMime.includes("ogg")) normalizedMime = "audio/ogg";

    const prompt = `
You are the Academic Speech Transcriber and Scribe Agent for Kintsugi Memory.
A student provided an audio recording (from a live lecture, meeting, or online video/YouTube audio).

CRITICAL DIRECTIVES:
1. FAITHFUL TRANSCRIPTION: Transcribe the ACTUAL SPOKEN WORDS in the audio recording with verbatim precision. Do not invent, hallucinate, or force unrelated topics.
2. TOPIC DETECTION: Identify the genuine subject, title, and topics directly from what is spoken in the audio.
3. TIMESTAMPS & DIARIZATION: Use timestamp tags of format [MM:SS] and identify distinct speaker turns (e.g. "[00:00] Speaker 1: ...", "[00:45] Speaker 2: ...").
4. SUMMARY & INVARIANTS: Formulate a 2-3 sentence executive cognitive summary of what was actually discussed in the audio. Extract core technical laws, theorems, concepts, and invariants mentioned.
5. EXAM ALERTS & ACTION ITEMS: Flag any critical warnings, key exam takeaways, or action items discussed in the recording.
${meetingTitle ? `\n(Optional Context Hint: "${meetingTitle}" - only use to assist with spelling technical terms if they actually match the spoken audio.)` : ''}
`;

    const audioCandidateModels = [
      modelName,
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.5-transcribe-preview",
      "gemini-3.6-flash",
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    for (const targetModel of audioCandidateModels) {
      try {
        console.log(`[SpeechService] Transcribing audio with model "${targetModel}"...`);
        const response = await ai.models.generateContent({
          model: targetModel,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: normalizedMime,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            audioTimestamp: true,
            systemInstruction:
              "You are an elite academic speech recognition AI. Produce faithful, verbatim timestamped transcripts with speaker diarization strictly based on the provided audio stream, avoiding any hallucination.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transcript: { type: Type.STRING, description: "Timestamped transcript with speaker tags" },
                summary: { type: Type.STRING, description: "Executive synthesis of lecture content" },
                keyInvariants: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                examAlerts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                subject: { type: Type.STRING },
              },
              required: ["transcript", "summary", "keyInvariants", "examAlerts", "actionItems"],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return {
            ...parsed,
            engineUsed: "gemini-multimodal-audio",
          };
        }
      } catch (geminiError: any) {
        console.warn(`[SpeechService] Model "${targetModel}" failed (${geminiError?.message?.slice(0, 100)}), trying next candidate...`);
      }
    }
  } catch (err: any) {
    console.warn("[SpeechService] Multimodal audio client notice:", err?.message || err);
  }

  // 2. Fallback: Google Cloud Speech-to-Text API
  if (speechClient) {
    let encoding: any = "WEBM_OPUS";
    let sampleRateHertz = 48000;

    if (mimeType.includes("wav")) {
      encoding = "LINEAR16";
      sampleRateHertz = 16000;
    } else if (mimeType.includes("mp3")) {
      encoding = "MP3";
      sampleRateHertz = 44100;
    }

    const request = {
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding,
        sampleRateHertz,
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
    };

    const [response] = await speechClient.recognize(request);
    if (!response.results || response.results.length === 0) {
      throw new Error("No speech could be recognized from the audio payload via Google Cloud Speech-to-Text.");
    }

    const rawTranscript = response.results
      .map((r) => r.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join("\n");

    return {
      transcript: rawTranscript,
      summary: `Transcribed audio content (${filename || "audio_recording"}) via Google Cloud Speech-to-Text.`,
      keyInvariants: ["Extracted speech engram"],
      examAlerts: ["Review recorded lecture transcript for key exam concepts."],
      actionItems: ["Review lecture notes and distill atomic concepts."],
      subject: subjectHint || "Academic Lecture",
      engineUsed: "google-cloud-speech",
    };
  }

  throw new Error(
    "Transcription failed: Please configure Google Cloud Vertex AI credentials on Cloud Run, or enter your API key in the Judge modal."
  );
}
