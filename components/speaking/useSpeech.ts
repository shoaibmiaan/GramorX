import { useEffect, useRef, useState } from 'react';

type Region = 'UK' | 'US' | 'AUS' | 'Default';

export function useSpeech({ defaultAccent = 'US' as Region } = {}) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>('');
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const has = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSupported(has);
    if (!has) return;

    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);

      const fromLS = localStorage.getItem('speech.voiceName');
      if (fromLS && v.find(vi => vi.name === fromLS)) {
        setVoiceName(fromLS);
        return;
      }
      if (!voiceName && defaultAccent !== 'Default') {
        const m = preferAccent(v, defaultAccent);
        if (m) setVoiceName(m.name);
      }
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (supported && voiceName) localStorage.setItem('speech.voiceName', voiceName);
  }, [voiceName, supported]);

  const speak = (text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === voiceName) || preferAccent(voices, defaultAccent) || voices[0];
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = 1; u.pitch = 1;
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
  };

  const pickRegion = (region: Region) => {
    const v = preferAccent(voices, region);
    if (v) setVoiceName(v.name);
  };

  return { supported, voices, voiceName, setVoiceName, speak, stop, pickRegion };
}

function preferAccent(voices: SpeechSynthesisVoice[], region: Region) {
  if (region === 'Default') return voices[0] ?? null;
  const map = { UK: 'en-GB', US: 'en-US', AUS: 'en-AU' } as const;
  const code = map[region];
  return voices.find(v => v.lang === code) || voices.find(v => v.lang?.startsWith(code)) || null;
}
