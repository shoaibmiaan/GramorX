import Head from 'next/head';
import '@/styles/premium-theme.css';
import { ThemeSwitcher } from '@/components/premium-ui/ThemeSwitcher';
import { PinGate } from '@/components/premium-ui/PinGate';
import { Button } from '@/components/premium-ui/Button';

export default function EnterPremium() {
  const goNext = () => {
    // After PIN verified, you can route to eligibility flow (Day 3) or shell
    window.location.href = '/premium/sandbox'; // temp: reuse sandbox as next step
  };

  return (
    <>
      <Head><title>Premium Access</title></Head>
      <div id="premium-root" className="premium-root" data-pr-theme="dark">
        <main className="pr-min-h-screen pr-bg-bg pr-text-text pr-font-premium pr-py-14 pr-px-6">
          <div className="pr-max-w-xl pr-mx-auto pr-space-y-8">
            <div className="pr-flex pr-items-center pr-justify-between">
              <h1 className="pr-text-2xl pr-font-bold">Premium Exam Room Access</h1>
              <ThemeSwitcher />
            </div>

            <section className="premium-glass pr-rounded-2xl pr-p-6">
              <PinGate onVerified={() => goNext()} />
              <div className="pr-flex pr-justify-between pr-items-center pr-mt-4 pr-text-sm pr-text-muted">
                <span>Need help? Contact support.</span>
                <Button onClick={() => (window.location.href = '/premium/sandbox')} className="pr-bg-accent pr-text-accentFg">Skip (dev)</Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
