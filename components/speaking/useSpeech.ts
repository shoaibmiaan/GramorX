// components/speaking/useSpeech.ts
// Provides a thin wrapper around the browser Speech Synthesis API
// so pages can easily perform text‑to‑speech with accent/voice selection.

import { useCallback, useEffect, useRef, useState } from 'react';

export type Accent = 'UK' | 'US' | 'AUS';
export type UseSpeechOpts = { defaultAccent?: Accent };

function pickVoiceByAccent(voices: SpeechSynthesisVoice[], accent: Accent) {
  const wantLang = accent === 'UK' ? 'en-GB' : accent === 'AUS' ? 'en-AU' : 'en-US';
  const exact = voices.find(v => v.lang === wantLang);
  if (exact) return exact;
  const anyEn = voices.find(v => v.lang?.startsWith('en'));
  return anyEn ?? voices[0];
}

export function useSpeech(opts: UseSpeechOpts = {}) {
  const { defaultAccent = 'US' } = opts;
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState('');

  // Load available voices and pick a default based on accent
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setSupported(true);

    const load = () => {
      const list = synth.getVoices();
      setVoices(list);
      if (!voiceName && list.length) {
        const v = pickVoiceByAccent(list, defaultAccent);
        if (v) setVoiceName(v.name);
      }
    };

    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!synthRef.current) return resolve();
        const voice = voices.find(v => v.name === voiceName) || voices[0];
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        synthRef.current!.cancel();
        synthRef.current!.speak(u);
      }),
    [voiceName, voices]
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
  }, []);

  const pickRegion = useCallback(
    (accent: Accent) => {
      const v = pickVoiceByAccent(voices, accent);
      if (v) setVoiceName(v.name);
    },
    [voices]
  );

  return { supported, voices, voiceName, setVoiceName, speak, stop, pickRegion };
}

