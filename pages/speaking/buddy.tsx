import React from 'react';
import { Container } from '@/components/design-system/Container';
import StudyBuddyMatch from '@/components/speaking/StudyBuddyMatch';

export default function SpeakingBuddyPage() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <StudyBuddyMatch />
      </Container>
    </section>
  );
}
