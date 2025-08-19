import { useEffect, useRef, useState } from "react";
export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => { return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); audioCtxRef.current?.close(); mediaStreamRef.current?.getTracks().forEach(t => t.stop()); }; }, []);
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream; const mediaRecorder = new MediaRecorder(stream); const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => { const b = new Blob(chunks, { type: "audio/webm" }); setBlob(b); };
    mediaRecRef.current = mediaRecorder; mediaRecorder.start(); setIsRecording(true);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream); const analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyserRef.current = analyser; dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount); src.connect(analyser);
    const tick = () => { if (!analyserRef.current || !dataArrayRef.current) return; analyserRef.current.getByteTimeDomainData(dataArrayRef.current); let sum = 0; for (let i=0;i<dataArrayRef.current.length;i++) { const v = (dataArrayRef.current[i] - 128) / 128; sum += Math.abs(v); } setLevel(Math.min(1, sum / dataArrayRef.current.length * 4)); rafRef.current = requestAnimationFrame(tick); };
    tick();
  };
  const stop = () => { mediaRecRef.current?.stop(); audioCtxRef.current?.close(); mediaStreamRef.current?.getTracks().forEach(t => t.stop()); setIsRecording(false); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  return { isRecording, level, blob, start, stop };
}