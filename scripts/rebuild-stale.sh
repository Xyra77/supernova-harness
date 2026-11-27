#!/usr/bin/env bash
# Rebuild every client package whose src/ is newer than its built lib/, then rebuild apps/web.
# Usage: pnpm rebuild:stale            (rebuild only stale packages)
#        pnpm rebuild:stale --check    (just list stale packages, exit 1 if any)
#        pnpm rebuild:stale --all      (force rebuild of every client package)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-}"
stale=()

for dir in "$ROOT"/packages/client/*/; do
  [ -f "$dir/package.json" ] || continue
  [ -d "$dir/src" ] || continue
  if [ "$MODE" = "--all" ]; then stale+=("$dir"); continue; fi
  if [ ! -d "$dir/lib" ]; then stale+=("$dir"); continue; fi
  # Compare with the newest built file: a directory's own mtime does not move when files inside are overwritten.
  ref="$(find "$dir/lib" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [ -z "$ref" ] && { stale+=("$dir"); continue; }
  newer="$(find "$dir/src" -type f -newer "$ref" ! -name '*.md' 2>/dev/null | head -1)"
  [ -n "$newer" ] && stale+=("$dir")
done

if [ "${#stale[@]}" -eq 0 ]; then
  echo "No stale client packages."
else
  echo "Stale client packages (${#stale[@]}):"
  for d in "${stale[@]}"; do echo "  - ${d#$ROOT/}"; done
fi
[ "$MODE" = "--check" ] && { [ "${#stale[@]}" -eq 0 ]; exit $?; }

fail=0
for d in "${stale[@]}"; do
  name="${d#$ROOT/}"
  echo ">> building $name"
  if grep -q '"bundle"' "$d/package.json"; then
    (cd "$d" && pnpm bundle >/tmp/rebuild-stale.log 2>&1) || { echo "   FAILED (see /tmp/rebuild-stale.log)"; fail=1; }
  elif [ -f "$d/tsdown.config.ts" ]; then
    (cd "$d" && pnpm exec tsdown >/tmp/rebuild-stale.log 2>&1) || { echo "   FAILED (see /tmp/rebuild-stale.log)"; fail=1; }
  else
    echo "   skipped (no bundle script or tsdown config)"
  fi
done

echo ">> building apps/web"
(cd "$ROOT/apps/web" && pnpm build >/tmp/rebuild-stale-web.log 2>&1) || { echo "   FAILED (see /tmp/rebuild-stale-web.log)"; fail=1; }

[ "$fail" -eq 0 ] && echo "Done. Restart 'pnpm snh web' and hard refresh the browser (Ctrl+Shift+R)." || echo "Finished with errors."
exit "$fail"
