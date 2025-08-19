import React from "react"; import { Card } from "../atoms/Card";
export function QuestionCard({ title, prompt }: { title: string; prompt: string }) {
  return (
    <Card>
      <h3 className="pr-text-xl pr-font-semibold pr-mb-2">{title}</h3>
      <p className="pr-text-base pr-text-muted">{prompt}</p>
    </Card>
  );
}