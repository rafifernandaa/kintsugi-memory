/**
 * Audio & Voice Module
 * - Speech Recognition (Web Speech API)
 * - Web Audio API procedural synthesis for Kintsugi golden chime & zen soundscape
 * - Text-to-speech for Socratic questioning
 */

export interface SpeechRecognitionHandler {
  start: () => void;
  stop: () => void;
  isListening: () => boolean;
}

export function createSpeechRecognizer(
  onTranscript: (deltaFinal: string, interimText: string, fullFinal: string) => void,
  onError: (err: string) => void
): SpeechRecognitionHandler | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let listening = false;
  let fullAccumulated = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    let delta = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        const cleanPiece = piece.trim();
        if (cleanPiece) {
          delta += (delta ? ' ' : '') + cleanPiece;
          fullAccumulated += (fullAccumulated ? ' ' : '') + cleanPiece;
        }
      } else {
        interim += piece;
      }
    }

    onTranscript(delta.trim(), interim.trim(), fullAccumulated.trim());
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition event error:', event.error);
    if (event.error !== 'no-speech') {
      onError(event.error);
    }
  };

  recognition.onend = () => {
    listening = false;
  };

  return {
    start: () => {
      try {
        fullAccumulated = '';
        listening = true;
        recognition.start();
      } catch (e) {
        console.warn('Recognition start notice:', e);
      }
    },
    stop: () => {
      try {
        listening = false;
        recognition.stop();
      } catch (e) {
        // ignore
      }
    },
    isListening: () => listening,
  };
}

// -------------------------------------------------------------
// WEB AUDIO API PROCEDURAL SOUND SYNTHESIS (No external assets)
// -------------------------------------------------------------
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
    return null;
  }
}

/**
 * Procedural Japanese Temple Bell / Golden Kintsugi Chime (harmonic bell shimmer)
 */
export function playGoldenKintsugiChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Fundamental + Shimmering Overtones (Wabi-Sabi bell frequencies)
  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(f, now + idx * 0.04);

    const initialGain = 0.15 / (idx + 1);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(initialGain, now + idx * 0.04 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.04);
    osc.stop(now + 2.2 + idx * 0.2);
  });
}

/**
 * Zen Ripple Focus Tone (deep soothing singing bowl gong)
 */
export function playZenFocusGong() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(216, now); // 216 Hz meditative frequency
  osc.frequency.exponentialRampToValueAtTime(108, now + 3.0);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 3.3);
}

/**
 * Subtle Timer Warning Tick for rapid challenge
 */
export function playTimerWarningTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now); // A5 alert
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * Procedural Rapid Bonus Chime when answering within speed tiers
 */
export function playRapidBonusChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6 quick ascending chime

  notes.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + idx * 0.05);

    gain.gain.setValueAtTime(0, now + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5 + idx * 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + 0.6 + idx * 0.05);
  });
}

// -------------------------------------------------------------
// WEB SPEECH SYNTHESIS (Text-to-Speech for Socratic Tutor)
// -------------------------------------------------------------
export function speakSocraticPrompt(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const cleanText = text.replace(/[*_#`]/g, ''); // strip markdown
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.rate = 0.95; // Calm, deliberate pace
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export const speakText = speakSocraticPrompt;

/**
 * Procedural Fanfare when unlocking a new Synaptic Mastery tier
 */
export function playLevelUpFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chordNotes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C major celebratory arpeggio

  chordNotes.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + 1.5 + idx * 0.1);
  });
}
