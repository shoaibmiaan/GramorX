import Link from 'next/link';

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Stub</h1>
      <p className="mt-2 opacity-80">Scaffolded page. Wire up real data & components.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/pricing" className="underline">Pricing</Link>
        <Link href="/study-plan" className="underline">Study Plan</Link>
        <Link href="/progress" className="underline">Progress</Link>
      </div>
    </div>
  );
}
