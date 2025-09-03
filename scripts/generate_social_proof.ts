#!/usr/bin/env ts-node
// scripts/backfill_entitlements.ts
/**
 * Backfills entitlements for all profiles based on membership plan.
 * Safe defaults: runs in dry-run unless --apply is provided.
 *
 * Env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { entitlementsForPlan, type PlanKey } from '@/lib/entitlements';

// @ts-expect-error Add supabase-js to deps when ready
import { createClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  membership: PlanKey | 'free' | null;
};

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, membership')
    .limit(10000);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  let updates = 0;
  for (const r of (rows as ProfileRow[])) {
    const plan = (r.membership ?? 'free') as PlanKey | 'free';
    const e = entitlementsForPlan(plan as PlanKey);
    if (apply) {
      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          // Store minimal fields; extend schema as needed to persist detail
          has_ai_feedback: e.ai_feedback,
          has_mock_tests: e.mock_tests,
          has_analytics: e.analytics,
          buddy_seats: e.buddy_seats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', r.id);
      if (upErr) {
        console.error('Update error for', r.id, upErr);
      } else {
        updates++;
      }
    } else {
      console.log(JSON.stringify({ id: r.id, plan, entitlements: e }));
    }
  }

  if (apply) {
    console.log(`Applied entitlements to ${updates} profiles`);
  } else {
    console.log(`Dry run complete (${rows?.length ?? 0} rows). Use --apply to write changes.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
