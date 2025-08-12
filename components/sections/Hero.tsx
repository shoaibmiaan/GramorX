'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';

type Word = { word: string; meaning: string; example: string };

const WORDS: Word[] = [
  { word: 'serendipity', meaning: 'the occurrence of events by chance in a happy or beneficial way', example: 'Finding this platform was pure serendipity - it helped me achieve my target band!' },
  { word: 'ubiquitous', meaning: 'present, appearing, or found everywhere', example: 'Mobile phones have become ubiquitous in modern society.' },
  { word: 'eloquent', meaning: 'fluent or persuasive in speaking or writing', example: 'Her eloquent speech impressed the examiners during the speaking test.' },
  { word: 'pragmatic', meaning: 'dealing with things sensibly and realistically', example: 'A pragmatic approach to IELTS preparation focuses on the most effective strategies.' },
  { word: 'diligent', meaning: "having or showing care and conscientiousness in one's work or duties", example: 'Diligent students who practice daily see the fastest improvement.' },
];

export const Hero: React.FC<{ onStreakChange: (n: number) => void }> = ({ onStreakChange }) => {
  const [mounted, setMounted] = useState(false);

  const [target, setTarget] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [word, setWord] = useState<Word | null>(null);

  useEffect(() => {
    setMounted(true);

    const t = new Date();
    t.setDate(t.getDate() + 7);
    setTarget(t);
    setNow(new Date());

    const s = typeof window !== 'undefined' ? localStorage.getItem('ieltsStreak') : null;
    const ld = typeof window !== 'undefined' ? localStorage.getItem('ieltsLastLearned') : null;
    if (s) setStreak(parseInt(s, 10));
    if (ld) setLastDate(ld);

    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);

    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { onStreakChange(streak); }, [streak, onStreakChange]);

  const diff = useMemo(() => {
    if (!target || !now) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const ms = +target - +now;
    const clamp = Math.max(ms, 0);
    const days = Math.floor(clamp / (1000 * 60 * 60 * 24));
    const hours = Math.floor((clamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((clamp % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((clamp % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [target, now]);

  function markLearned() {
    const today = new Date().toDateString();
    if (lastDate === today) return;
    const newStreak = streak + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ieltsStreak', String(newStreak));
      localStorage.setItem('ieltsLastLearned', today);
    }
    setStreak(newStreak);
    setLastDate(today);
    setTimeout(() => setWord(WORDS[Math.floor(Math.random() * WORDS.length)]), 5000);
  }

  if (!mounted) {
    return (
      <section className="min-h-[60vh] flex items-center py-24 relative">
        <Container>
          <div className="max-w-2xl">
            <h1 className="font-slab text-5xl md:text-6xl font-bold mb-5 leading-tight">
              <span className="text-gradient-accent">
                ACHIEVE YOUR DREAM IELTS SCORE WITH AI-POWERED PREPARATION
              </span>
            </h1>
            <div className="h-32" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-[100vh] flex items-center py-24 relative">
      <Container>
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-slab text-5xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-gradient-accent">
              ACHIEVE YOUR DREAM IELTS SCORE WITH AI-POWERED PREPARATION
            </span>
          </h1>
          <p className="text-lg text-[#d0d0e0] mb-8 max-w-xl">
            Master all four IELTS skills with personalized feedback, adaptive learning paths, and realistic mock tests. Join thousands of
            successful candidates who&apos;ve achieved Band 7+ with our platform.
          </p>

          <Card className="inline-block p-6 rounded-2xl">
            <div className="text-neonGreen font-semibold mb-3">PRE-LAUNCH ACCESS IN</div>
            <div className="flex gap-5">
              {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, idx) => {
                const values = [diff.days, diff.hours, diff.minutes, diff.seconds] as number[];
                const value = values[idx] || 0;
                return (
                  <div key={label} className="text-center">
                    <div className="font-slab text-4xl md:text-5xl font-bold text-gradient-vertical">
                      {String(value).padStart(2, '0')}
                    </div>
                    <div className="uppercase tracking-wide text-grayish text-sm mt-1">{label}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="mt-6 max-w-md p-6 rounded-2xl">
            <h3 className="text-neonGreen font-semibold text-xl mb-4">
              <i className="fas fa-book mr-2" />
              Word of the Day
            </h3>
            {word && (
              <div className="mb-4">
                <h4 className="text-3xl mb-1 text-neonGreen">{word.word}</h4>
                <div className="text-[1.05rem] text-[#d0d0e0] mb-3">{word.meaning}</div>
                <div className="italic text-electricBlue border-l-4 pl-4 border-electricBlue">"{word.example}"</div>
              </div>
            )}
            <Button variant="accent" onClick={markLearned}>
              <i className="fas fa-check-circle mr-2" />
              Mark as Learned
            </Button>

            <div className="mt-4 rounded-xl p-4 bg-purpleVibe/15">
              <div className="flex items-center gap-4">
                <div className="text-2xl text-sunsetOrange">
                  <i className="fas fa-fire" />
                </div>
                <div>
                  <h4 className="font-semibold">Your Learning Streak</h4>
                  <div>
                    Current streak:{' '}
                    <span className="font-bold text-sunsetOrange">
                      {streak} {streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div>
                    Value at launch:{' '}
                    <span className="font-bold text-neonGreen">
                      ${(streak * 0.5).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Alert variant="info" className="mt-4">
              Maintain your streak! Each day you learn a new word, your streak increases. At launch,
              your streak will be converted to dollars that you can apply to your subscription.
            </Alert>
          </Card>

          <div className="flex gap-4 mt-8">
            <Button as="a" href="#waitlist" variant="primary">
              Join Exclusive Waitlist
            </Button>
            <Button as="a" href="#modules" variant="secondary">
              Explore Features
            </Button>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 max-w-[600px] opacity-80 hidden md:block">
          <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="300" r="200" fill="none" stroke="rgba(157, 78, 221, 0.3)" strokeWidth="20" />
            <circle cx="300" cy="300" r="170" fill="none" stroke="rgba(0, 187, 249, 0.3)" strokeWidth="20" />
            <circle cx="300" cy="300" r="140" fill="none" stroke="rgba(255, 107, 107, 0.3)" strokeWidth="20" />
            <circle cx="300" cy="300" r="110" fill="none" stroke="rgba(128, 255, 219, 0.3)" strokeWidth="20" />
            <text x="300" y="250" textAnchor="middle" fill="#9d4edd" fontSize="40" fontWeight="bold">Listening</text>
            <text x="380" y="320" textAnchor="middle" fill="#00bbf9" fontSize="40" fontWeight="bold">Reading</text>
            <text x="300" y="400" textAnchor="middle" fill="#ff6b6b" fontSize="40" fontWeight="bold">Writing</text>
            <text x="220" y="320" textAnchor="middle" fill="#80ffdb" fontSize="40" fontWeight="bold">Speaking</text>
            <circle cx="300" cy="300" r="30" fill="#9d4edd" />
            <text x="300" y="310" textAnchor="middle" fill="white" fontSize="20">8.5</text>
          </svg>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
