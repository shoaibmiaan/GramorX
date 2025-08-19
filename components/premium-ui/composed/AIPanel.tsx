import React from "react"; import { Card } from "../atoms/Card"; import { Progress } from "../atoms/Progress"; import { Badge } from "../atoms/Badge";
export interface AIFeedback { band: number; criteria: Array<{ name: string; score: number; tip: string }>; summary: string; }
export function AIPanel({ loading, feedback }: { loading: boolean; feedback?: AIFeedback }) {
  return (
    <Card className="pr-sticky pr-top-4 pr-grid pr-gap-4">
      <div className="pr-flex pr-items-center pr-justify-between">
        <h4 className="pr-text-lg pr-font-semibold">AI Feedback</h4>
        {feedback ? <Badge tone="success">Band {feedback.band.toFixed(1)}</Badge> : <Badge>Awaiting…</Badge>}
      </div>
      {loading ? (
        <div className="pr-grid pr-gap-2">{new Array(3).fill(0).map((_,i)=> <div key={i} className="pr-h-6 pr-rounded pr-bg-text/10 pr-animate-pulse"/>)}</div>
      ) : feedback ? (
        <div className="pr-grid pr-gap-3">
          {feedback.criteria.map((c) => (
            <div key={c.name} className="pr-grid pr-gap-1">
              <div className="pr-flex pr-justify-between pr-text-sm"><span>{c.name}</span><span>{c.score.toFixed(1)}/9</span></div>
              <Progress value={(c.score/9)*100} />
              <p className="pr-text-xs pr-text-muted">{c.tip}</p>
            </div>
          ))}
          <p className="pr-text-sm pr-text-muted">{feedback.summary}</p>
        </div>
      ) : (<p className="pr-text-sm pr-text-muted">Speak your answer to see instant guidance.</p>)}
    </Card>
  );
}