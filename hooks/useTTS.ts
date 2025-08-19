import { useRef, useState } from "react";
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = (text: string, onend?: () => void) => {
    if (!("speechSynthesis" in window)) { console.warn("SpeechSynthesis not supported"); onend?.(); return; }
    if (utterRef.current) { window.speechSynthesis.cancel(); }
    const utter = new SpeechSynthesisUtterance(text); utter.rate = 1; utter.pitch = 1; utter.onend = () => { setSpeaking(false); onend?.(); }; utter.onerror = () => { setSpeaking(false); onend?.(); };
    utterRef.current = utter; setSpeaking(true); window.speechSynthesis.speak(utter);
  };
  const cancel = () => { if (utterRef.current) { window.speechSynthesis.cancel(); setSpeaking(false); } };
  return { speak, cancel, speaking };
}