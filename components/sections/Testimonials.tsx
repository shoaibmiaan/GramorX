import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

const data = [
  {initials:'MJ', name:'Michael Johnson', delta:'Band 7.5 to 8.0 in 6 weeks', text:'The AI writing evaluation was a game-changer. It pinpointed my grammatical errors and showed me exactly how to improve my task response. I\'ve never had such detailed feedback before!', band:'8.0'},
  {initials:'SR', name:'Sarah Rodriguez', delta:'Band 6.5 to 7.5 in 8 weeks', text:'The speaking simulator helped me overcome my nervousness. Practicing with the AI partner gave me the confidence I needed for the real test. The accent adaptation feature was incredibly useful!', band:'7.5'},
  {initials:'DK', name:'David Kim', delta:'Band 6.0 to 7.0 in 4 weeks', text:'The adaptive learning module saved me so much time. It knew exactly what I needed to work on and created the perfect study plan. My reading score improved by 1.5 bands in just one month!', band:'7.0'},
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">SUCCESS STORIES</h2>
          <p className="text-grayish text-lg">Hear from candidates who improved their scores with our platform</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {data.map(t => (
            <Card key={t.name} className="p-7 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 bg-gradient-to-br from-purpleVibe to-electricBlue">{t.initials}</div>
                <div>
                  <h4 className="text-lg font-semibold">{t.name}</h4>
                  <div className="text-sm text-electricBlue">{t.delta}</div>
                </div>
              </div>
              <p className="italic text-[#d0d0e0]">{t.text}</p>
              <div className="mt-4 text-neonGreen font-semibold flex items-center gap-2"><i className="fas fa-medal" /> Overall Band: {t.band}</div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
