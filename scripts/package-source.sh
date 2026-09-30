#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="${1:-${PROJECT_ROOT}/../agrisense-ai-source.zip}"
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$OUTPUT"

cd "$(dirname "$PROJECT_ROOT")"
zip -qr "$OUTPUT" "$(basename "$PROJECT_ROOT")" \
  -x "$(basename "$PROJECT_ROOT")/node_modules/*" \
     "$(basename "$PROJECT_ROOT")/.git/*" \
     "$(basename "$PROJECT_ROOT")/dist/*" \
     "$(basename "$PROJECT_ROOT")/.env" \
     "$(basename "$PROJECT_ROOT")/.env.*"

echo "Created $OUTPUT"
