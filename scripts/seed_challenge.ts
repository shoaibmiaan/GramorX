// scripts/seed_challenge.ts
// Usage: npx tsx scripts/seed_challenge.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, key, { auth: { persistSession: false } });

type SeedCohort = { id: string; startDate: string; days: number };

const COHORTS: SeedCohort[] = [
  { id: 'BandBoost-Sep2025', startDate: '2025-09-05', days: 14 },
  { id: 'WritingFocus-Oct2025', startDate: '2025-10-01', days: 14 },
  { id: 'SpeakingFluency-Oct2025', startDate: '2025-10-10', days: 14 },
];

async function main() {
  console.log('Seeding challenge enrollments…');

  // get or create fake users to enroll (replace with real IDs in prod)
  const userIds: string[] = [];
  for (let i = 0; i < 5; i++) {
    // Create a random UUID-like id for demo (does not insert into auth.users)
    // In real seeding, create auth users via Admin API and use those ids.
    userIds.push(`00000000-0000-4000-8000-0000000000${i}`);
  }

  for (const cohort of COHORTS) {
    for (const uid of userIds) {
      const progress: Record<string, 'pending' | 'done' | 'skipped'> = {};
      const doneDays = Math.floor(Math.random() * cohort.days);
      for (let d = 1; d <= doneDays; d++) progress[`day${d}`] = 'done';

      const { data, error } = await supabase
        .from('challenge_enrollments')
        .upsert(
          {
            user_id: uid,
            cohort: cohort.id,
            progress,
            completed: doneDays >= cohort.days,
          },
          { onConflict: 'user_id,cohort' }
        )
        .select('id');

      if (error) console.error('upsert error:', error.message);
      else console.log(`↑ enrollment ${cohort.id} for user ${uid} (${data?.[0]?.id || 'id?'})`);
    }
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
