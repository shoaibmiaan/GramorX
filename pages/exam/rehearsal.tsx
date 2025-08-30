import DeviceCheck from '@/components/exam/DeviceCheck';
import TimingRehearsal from '@/components/exam/TimingRehearsal';
import AnxietyScripts from '@/components/exam/AnxietyScripts';
import ExamChecklist from '@/components/exam/ExamChecklist';
import ExamLayout from '@/components/layouts/ExamLayout';

export default function ExamRehearsalPage() {
  return (
    <ExamLayout exam="rehearsal" seconds={0} title="Exam Rehearsal">
      <div className="space-y-8">
        <DeviceCheck />
        <TimingRehearsal />
        <AnxietyScripts />
        <ExamChecklist />
      </div>
    </ExamLayout>
  );
}
