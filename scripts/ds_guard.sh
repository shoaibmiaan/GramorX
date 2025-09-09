#!/usr/bin/env bash
set -euo pipefail

RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; NC=$'\e[0m'

ALLOWED="docs/audit/guard_allowlist.txt"
DIRS="components pages layouts premium-ui common lib"
INCLUDES=(--include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' --include='*.css')
EXCLUDES=(--exclude-dir node_modules --exclude-dir .next --exclude-dir public --exclude-dir .storybook --exclude-dir docs --exclude-dir supabase --exclude-dir db --exclude-dir tests --exclude-dir __tests__)

fail=0

filter_allowlist() {
  if [[ -f "$ALLOWED" ]]; then
    grep -v -F -f "$ALLOWED" || true
  else
    cat
  fi
}

check() {
  local name="$1"; shift
  local pattern="$1"; shift
  local files
  echo "▶ Checking: $name"
  files=$(grep -RInE "$pattern" $DIRS "${INCLUDES[@]}" "${EXCLUDES[@]}" || true)
  files=$(printf "%s" "$files" | filter_allowlist || true)
  if [[ -n "${files// /}" ]]; then
    echo "$files"
    echo "${RED}✖ FAIL${NC} $name"
    fail=1
  else
    echo "${GREEN}✔ PASS${NC} $name"
  fi
  echo
}

# 1) focus:ring-* (should use focus-visible)
check "No raw focus:ring- (use focus-visible)" '\bfocus:ring-'

# 2) Arbitrary Tailwind color brackets with hex/rgb/hsl
check "No arbitrary color brackets (Tailwind [])" '\[[^]]*(#|rgb|hsl)[^]]*\]'

# 3) Raw hex colors in app code
check "No raw hex colors in code" '#[0-9A-Fa-f]{3,8}\b'

# 4) Inline styles with color values
check "No inline style colors" 'style=\{\{[^}]*(#|rgb|hsl)[^}]*\}\}'

# 5) <img> usage (use next/image)
check "No <img> tags in app code" '<img[[:space:]]'

if [[ $fail -ne 0 ]]; then
  echo "${RED}Design-System guard failed. See matches above.${NC}"
  echo "If a match is intentional, add a line to $ALLOWED"
  exit 1
else
  echo "${GREEN}All DS checks passed.${NC}"
fi
