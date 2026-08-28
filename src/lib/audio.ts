/**
 * Audio & Voice Module
 * - Speech Recognition (Web Speech API)
 * - Web Audio API procedural synthesis for Kintsugi golden chime & zen soundscape
 * - Text-to-speech for Socratic questioning
 */

export interface SpeechRecognitionHandler {
  start: () => void;
  stop: () => void;
  isListening: boolean;
}

export function createSpeechRecognizer(
  onTranscript: (text: string, isFinal: boolean) => void,
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

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    const currentText = final || interim;
    onTranscript(currentText, !!final);
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition event error:', event.error);
    listening = false;
    onError(event.error);
  };

  recognition.onend = () => {
    listening = false;
  };

  return {
    start: () => {
      try {
        listening = true;
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started or error:', e);
      }
    },
    stop: () => {
      try {
        listening = false;
        recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    },
    get isListening() {
      return listening;
    },
  };
}

// Procedural Wabi-Sabi Golden Joinery Chime (synthesized via Web Audio API)
export function playGoldenKintsugiChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Harmonic pentatonic bell frequencies (Japanese Insen scale)
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18 / (index + 1), now + index * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 1.8);
    });
  } catch (err) {
    console.warn('Audio playback not permitted yet:', err);
  }
}

// Procedural Level Up Triumph Fanfare
export function playLevelUpFanfare() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Rising triumph arpeggio: C4, E4, G4, C5, E5, G5, C6 with golden overtone
    const notes = [
      { freq: 261.63, time: 0, dur: 0.15 },
      { freq: 329.63, time: 0.12, dur: 0.15 },
      { freq: 392.0, time: 0.24, dur: 0.15 },
      { freq: 523.25, time: 0.36, dur: 0.2 },
      { freq: 659.25, time: 0.52, dur: 0.2 },
      { freq: 783.99, time: 0.68, dur: 0.3 },
      { freq: 1046.5, time: 0.9, dur: 1.2 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.2, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.1);
    });
  } catch (err) {
    console.warn('Level up fanfare audio error:', err);
  }
}

// Procedural Rapid Bonus Multiplier Chime
export function playRapidBonusChime(multiplier: number = 2) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const baseFreq = 440 * Math.min(2.5, Math.max(1, multiplier * 0.6));
    const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  } catch (err) {
    console.warn('Rapid chime error:', err);
  }
}

// Timer tick warning sound
export function playTimerWarningTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (err) {
    // silent
  }
}

// Speak text using browser speech synthesis with callback
export function speakText(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel(); // cancel prior speech

  const cleanText = text.replace(/[*_#`]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95; // deliberate, professorial cadence
  utterance.pitch = 0.98;

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel'))
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
