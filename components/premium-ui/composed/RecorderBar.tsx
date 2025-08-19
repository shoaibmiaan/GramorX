import React from "react"; import { Button } from "../atoms/Button"; import { MicIndicator } from "./MicIndicator";
export function RecorderBar({ isRecording, onStart, onStop, level = 0 }: { isRecording: boolean; onStart: () => void; onStop: () => void; level?: number; }) {
  return (
    <div className="pr-flex pr-items-center pr-justify-between pr-gap-3 pr-p-3 pr-rounded-2xl pr-border pr-border-border pr-bg-surface premium-glass">
      <MicIndicator active={isRecording} level={level} />
      <div className="pr-flex pr-gap-2">{!isRecording ? <Button onClick={onStart}>Start</Button> : <Button variant="danger" onClick={onStop}>Stop</Button>}</div>
    </div>
  );
}