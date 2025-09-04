import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

const data = [
  {
    initials: 'MJ',
    name: 'Michael Johnson',
    delta: 'Band 7.5 to 8.0 in 6 weeks',
    text:
      "The AI writing evaluation was a game-changer. It pinpointed my grammatical errors and showed me exactly how to improve my task response. I've never had such detailed feedback before!",
    band: '8.0',
  },
  {
    initials: 'SR',
    name: 'Sarah Rodriguez',
    delta: 'Band 6.5 to 7.5 in 8 weeks',
    text:
      'The speaking simulator helped me overcome my nervousness. Practicing with the AI partner gave me the confidence I needed for the real test. The accent adaptation feature was incredibly useful!',
    band: '7.5',
  },
  {
    initials: 'DK',
    name: 'David Kim',
    delta: 'Band 6.0 to 7.0 in 4 weeks',
    text:
      'The adaptive learning module saved me so much time. It knew exactly what I needed to work on and created the perfect study plan. My reading score improved by 1.5 bands in just one month!',
    band: '7.0',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="section-dark py-24">
      <Container>
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="font-slab uppercase tracking-tight text-h2 md:text-display text-gradient-primary">
            Success Stories
          </h2>
          <p className="mt-3 text-grayish">
            Hear from candidates who improved their scores with our platform
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
          {data.map((t) => (
            <Card
              key={t.name}
              variant="glass"
              className="
                p-7 rounded-ds-2xl border border-vibrantPurple/20
                transition duration-300 hover:-translate-y-1 hover:shadow-glowLg hover:border-vibrantPurple/40
              "
            >
              <div className="flex items-center mb-5">
                <div
                  className="
                    w-14 h-14 rounded-full mr-4 flex items-center justify-center
                    text-white font-bold text-xl
                    bg-gradient-to-br from-purpleVibe to-electricBlue shadow-glow
                  "
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{t.name}</h4>
                  <div className="text-sm text-electricBlue">{t.delta}</div>
                </div>
              </div>

              <p className="italic text-lightText/80 dark:text-white/80">
                <i className="fas fa-quote-left mr-2 text-electricBlue/80" aria-hidden />
                {t.text}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-neonGreen font-semibold">
                  <i className="fas fa-medal" aria-hidden />
                  Overall Band: {t.band}
                </span>

                {/* subtle verified chip to match desired style accents */}
                <span className="px-3 py-1 rounded-full bg-electricBlue/10 text-electricBlue text-sm">
                  Verified
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};