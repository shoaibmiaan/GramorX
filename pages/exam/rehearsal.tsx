import DeviceCheck from '@/components/exam/DeviceCheck';
import TimingRehearsal from '@/components/exam/TimingRehearsal';
import AnxietyScripts from '@/components/exam/AnxietyScripts';
import ExamChecklist from '@/components/exam/ExamChecklist';
import { Container } from '@/components/design-system/Container';

export default function ExamRehearsalPage() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 mb-8">Exam Rehearsal</h1>
        <DeviceCheck />
        <TimingRehearsal />
        <AnxietyScripts />
        <ExamChecklist />
      </Container>
    </section>
  );
}
