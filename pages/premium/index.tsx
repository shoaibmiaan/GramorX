import React from "react";
import Link from "next/link";
import { PremiumShell } from "@/components/premium-ui/layout/PremiumShell";
import { Card } from "@/components/premium-ui/atoms/Card";
import { Button } from "@/components/premium-ui/atoms/Button";
import { Badge } from "@/components/premium-ui/atoms/Badge";

export default function PremiumHome() {
  return (
    <div className="pr-p-6 pr-text-text">
      <PremiumShell>
        <Card className="pr-p-8">
          <div className="pr-grid pr-gap-8 lg:pr-grid-cols-2">
            <div>
              <Badge className="pr-mb-3">Premium Exam Room</Badge>
              <h1 className="pr-text-3xl pr-font-extrabold pr-leading-tight pr-mb-3">
                Precision practice, premium focus.
              </h1>
              <p className="pr-text-muted pr-mb-6">
                Auto-read, timed mic, waveform, instant AI band. Switch themes anytime.
              </p>
              <div className="pr-flex pr-gap-3">
                <Link href="/premium/exam/room"><Button>Enter Exam Room</Button></Link>
                <Link href="/"><Button variant="secondary">Back to Portal</Button></Link>
              </div>
            </div>

            {/* Elegant preview panel */}
            <div className="pr-rounded-2xl pr-border pr-border-border pr-bg-surface premium-glass pr-p-6">
              <div className="pr-aspect-[16/10] pr-rounded-xl pr-bg-gradient-to-br pr-from-primary/20 pr-to-accent/20 pr-border pr-border-border" />
              <ul className="pr-mt-4 pr-text-sm pr-text-muted pr-space-y-2 pr-list-disc pr-pl-5">
                <li>Auto TTS → 15s mic → auto-stop</li>
                <li>Live waveform & noise level</li>
                <li>Instant AI feedback (upgrade to Gemini/Grok)</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="pr-grid pr-gap-4 md:pr-grid-cols-3 pr-mt-6">
          <Card className="pr-p-6"><h3 className="pr-font-semibold pr-mb-1">Fast</h3><p className="pr-text-sm pr-text-muted">Zero-config start.</p></Card>
          <Card className="pr-p-6"><h3 className="pr-font-semibold pr-mb-1">Accurate</h3><p className="pr-text-sm pr-text-muted">Band + criteria tips.</p></Card>
          <Card className="pr-p-6"><h3 className="pr-font-semibold pr-mb-1">Secure</h3><p className="pr-text-sm pr-text-muted">PIN-gated access.</p></Card>
        </div>
      </PremiumShell>
    </div>
  );
}
