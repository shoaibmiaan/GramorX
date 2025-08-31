#!/usr/bin/env bash
set -euo pipefail

files=(
  "design-system/tokens/scale.js"
  "lib/env.ts"
  "lib/flags.ts"
  "lib/analytics/events.ts"
  "lib/analytics/track.ts"
  "lib/analytics/providers/ga4.ts"
  "lib/analytics/providers/meta.ts"
  "lib/monitoring/sentry.ts"
  "pages/api/healthz.ts"
  "db/migrations/001_core.sql"
  "db/migrations/002_referrals_partners.sql"
  "db/migrations/003_learning_progress.sql"
  "db/migrations/004_attempts.sql"
  "db/migrations/005_challenge_certificates.sql"
  "types/supabase.ts"
  "scripts/gen-types.ts"
)

created=()
skipped=()

for f in "${files[@]}"; do
  dir="$(dirname "$f")"
  mkdir -p "$dir"
  if [[ -e "$f" ]]; then
    skipped+=("$f")
  else
    : > "$f"   # create empty file without overwriting existing
    created+=("$f")
  fi
done

echo "✅ Created ${#created[@]} file(s)."
for x in "${created[@]}"; do echo "  + $x"; done
echo "⏭️  Skipped ${#skipped[@]} existing file(s)."
for x in "${skipped[@]}"; do echo "  - $x"; done
