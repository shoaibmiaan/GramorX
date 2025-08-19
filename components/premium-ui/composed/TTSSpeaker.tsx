import React from "react"; import { Button } from "../atoms/Button";
export function TTSSpeaker({ speaking, onSpeak }: { speaking: boolean; onSpeak: () => void }) {
  return (
    <div className="pr-flex pr-items-center pr-gap-2">
      <Button variant="secondary" onClick={onSpeak} disabled={speaking} leftIcon={<span>🔊</span>}>
        {speaking ? "Speaking…" : "Read Question"}
      </Button>
    </div>
  );
}