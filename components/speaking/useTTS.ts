// components/speaking/useTTS.ts
export type Accent = 'UK' | 'US' | 'AUS';

function pickVoice(voices: SpeechSynthesisVoice[], accent: Accent) {
  const wantLang =
    accent === 'UK' ? 'en-GB' : accent === 'AUS' ? 'en-AU' : 'en-US';
  const exact = voices.find(v => v.lang === wantLang);
  if (exact) return exact;
  const anyEn = voices.find(v => v.lang?.startsWith('en'));
  return anyEn ?? voices[0];
}

export function useTTS() {
  const speak = (text: string, accent: Accent, rate = 1) =>
    new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        // No TTS -> resolve so flow continues
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      const go = () => {
        const voices = synth.getVoices();
        const u = new SpeechSynthesisUtterance(text);
        u.voice = pickVoice(voices, accent);
        u.rate = rate;
        u.onend = () => resolve();
        u.onerror = () => resolve(); // fail-open
        synth.cancel(); // clear anything pending
        synth.speak(u);
      };

      const ready = synth.getVoices();
      if (!ready || ready.length === 0) {
        const handler = () => {
          synth.removeEventListener('voiceschanged', handler);
          go();
        };
        synth.addEventListener('voiceschanged', handler);
        // Fallback: if event never fires, still continue soon
        setTimeout(() => {
          synth.removeEventListener('voiceschanged', handler);
          go();
        }, 1200);
      } else {
        go();
      }
    });

  return { speak };
}
