import { Card } from '@/components/design-system/Card';

const scripts = [
  'Take a deep breath and focus on the present task.',
  'Remember, this rehearsal is for practice and learning.',
  'If you make a mistake, note it and move on—perfection is not the goal today.',
];

export default function AnxietyScripts() {
  return (
    <Card className="card-surface p-6 rounded-ds-2xl mb-6">
      <h2 className="font-slab text-h2 mb-2">Anxiety Scripts</h2>
      <p className="mb-4 text-grayish">Read these prompts aloud to calm nerves before the exam.</p>
      <ul className="list-disc pl-5 space-y-2">
        {scripts.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </Card>
  );
}
