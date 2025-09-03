import * as React from "react";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="text-sm opacity-80">Your profile & quick links.</p>

      <div className="mt-4 flex gap-2">
        <Link href="/settings/language" className="rounded-md border px-3 py-1.5 text-sm">
          Language
        </Link>
        <Link href="/challenge" className="rounded-md border px-3 py-1.5 text-sm">
          Challenges
        </Link>
      </div>
    </div>
  );
}
