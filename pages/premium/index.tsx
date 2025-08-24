import * as React from 'react';
import { ThemeSwitcher } from '@/premium-ui/theme/ThemeSwitcher';
import { PrCard } from '@/premium-ui/components/PrCard';
import { PrButton } from '@/premium-ui/components/PrButton';


export default function PremiumHome() {
return (
<main className="pr-p-6 pr-space-y-6">
<div className="pr-flex pr-items-center pr-justify-between">
<h1 className="pr-text-2xl pr-font-semibold">Premium Exam Room</h1>
<ThemeSwitcher />
</div>


<div className="pr-grid md:pr-grid-cols-2 pr-gap-6">
<PrCard className="pr-p-6">
<h2 className="pr-text-lg pr-font-semibold">IELTS Listening</h2>
<p className="pr-muted pr-mt-2">Strict playback, timers, and section navigation.</p>
<div className="pr-mt-4">
<PrButton onClick={() => (window.location.href = '/premium/listening/sample-test')}>Start Sample Test</PrButton>
</div>
</PrCard>


<PrCard className="pr-p-6">
<h2 className="pr-text-lg pr-font-semibold">IELTS Reading</h2>
<p className="pr-muted pr-mt-2">Passage panes, answers grid, and review flags.</p>
<div className="pr-mt-4">
<PrButton variant="outline" disabled>Coming soon</PrButton>
</div>
</PrCard>
</div>
</main>
);
}