import React, { useEffect, useState } from "react";
import { PremiumShell } from "@/components/premium-ui/layout/PremiumShell";
import { Card } from "@/components/premium-ui/atoms/Card";
import { Button } from "@/components/premium-ui/atoms/Button";
import { RecorderBar } from "@/components/premium-ui/composed/RecorderBar";
import { Timer } from "@/components/premium-ui/composed/Timer";
import { TTSSpeaker } from "@/components/premium-ui/composed/TTSSpeaker";
import { Waveform } from "@/components/premium-ui/composed/Waveform";
import { AIPanel, type AIFeedback } from "@/components/premium-ui/composed/AIPanel";
import { QuestionCard } from "@/components/premium-ui/composed/QuestionCard";
import { useRecorder } from "@/hooks/useRecorder";
import { useTTS } from "@/hooks/useTTS";
import { usePremiumTheme } from "@/hooks/usePremiumTheme";
import { useCountdown } from "@/hooks/useCountdown";
import { evaluateSpeakingMock } from "@/lib/ai/evaluate";
import { ANSWER_SECONDS } from "@/lib/premium/constants";

const PART1_QUESTIONS = [
  "What is your full name?",
  "Where are you from?",
  "Do you work or are you a student?",
  "What do you like about your hometown?",
  "How do you usually spend your weekends?",
  "Do you prefer studying alone or with others? Why?",
  "What kind of music do you enjoy?",
  "Do you think technology has changed the way we learn? How?"
];

export default function ExamRoom() {
  usePremiumTheme("light");
  const [qIndex, setQIndex] = useState(0);
  const question = PART1_QUESTIONS[qIndex] ?? "—";
  const { isRecording, start, stop, level, blob } = useRecorder();
  const { seconds, running, start: startTimer, stop: stopTimer, reset: resetTimer } = useCountdown(ANSWER_SECONDS);
  const { speak, speaking } = useTTS();
  const [samples, setSamples] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<AIFeedback | undefined>(undefined);
  const [evaluating, setEvaluating] = useState(false);

  // fake waveform samples while recording
  useEffect(() => {
    let raf: number; const loop = () => { setSamples((s) => { const next = s.slice(-200); next.push(Math.random() * 0.7); return next; }); raf = requestAnimationFrame(loop); };
    if (isRecording) loop();
    return () => cancelAnimationFrame(raf);
  }, [isRecording]);

  // auto-stop when timer hits 0
  useEffect(() => { if (!running && isRecording) { stop(); } }, [running, isRecording, stop]);

  const nextQuestion = () => { setQIndex((i) => Math.min(i + 1, PART1_QUESTIONS.length - 1)); };

  const onSpeak = () => {
    speak(question, () => { start(); resetTimer(); startTimer(); });
  };

  const onStop = async () => {
    stop(); stopTimer(); if (blob) { setEvaluating(true); const fb = await evaluateSpeakingMock(question); setFeedback(fb); setEvaluating(false); }
  };

  useEffect(() => {
    if (!isRecording && !running && blob) { (async () => { setEvaluating(true); const fb = await evaluateSpeakingMock(question); setFeedback(fb); setEvaluating(false); })(); }
  }, [isRecording, running, blob, question]);

  return (
    <div className="pr-p-6 pr-text-text">
      <PremiumShell>
        <div className="pr-grid pr-grid-cols-1 xl:pr-grid-cols-[1fr_360px] pr-gap-6">
          <div className="pr-grid pr-gap-6">
            <Card>
              <div className="pr-flex pr-items-center pr-justify-between pr-mb-4">
                <h2 className="pr-text-2xl pr-font-semibold">Part 1 · Interview</h2>
                <div className="pr-flex pr-gap-2">
                  <TTSSpeaker speaking={speaking} onSpeak={onSpeak} />
                  <Button variant="secondary" onClick={() => { resetTimer(); stop(); }}>Reset</Button>
                </div>
              </div>
              <QuestionCard title={`Question ${qIndex+1}/${PART1_QUESTIONS.length}`} prompt={question} />
              <div className="pr-my-4"><Timer seconds={ANSWER_SECONDS - seconds} total={ANSWER_SECONDS} /></div>
              <div className="pr-grid pr-gap-4">
                <Waveform samples={samples} />
                <RecorderBar isRecording={isRecording} onStart={onSpeak} onStop={onStop} level={level} />
              </div>
              <div className="pr-flex pr-justify-between pr-mt-4">
                <Button variant="secondary" onClick={() => setQIndex(Math.max(0, qIndex-1))} disabled={qIndex===0}>Previous</Button>
                <Button onClick={() => { nextQuestion(); setFeedback(undefined); }}>Next Question</Button>
              </div>
            </Card>
          </div>
          <div><AIPanel loading={evaluating} feedback={feedback} /></div>
        </div>
      </PremiumShell>
    </div>
  );
}