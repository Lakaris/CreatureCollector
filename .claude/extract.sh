#!/bin/sh
# Extracts a line range from src/App.js into its own module, auto-generating
# imports and appending an export. Refactor tooling -- not shipped with the game.
#
# Usage: extract.sh <start> <end> <outfile> <prefix> <ExportName> ["header comment"]

START="$1"; END="$2"; OUT="$3"; PREFIX="$4"; NAME="$5"; HEADER="$6"
SRC="src/App.js"
DIR=$(dirname "$OUT")
mkdir -p "$DIR"

TMP="$DIR/.__body.js"
sed -n "${START},${END}p" "$SRC" > "$TMP"

# only pull in the hooks this module actually references bare
HOOKS=""
for h in useState useMemo useEffect useRef useLayoutEffect useCallback; do
  if grep -qE "(^|[^.A-Za-z0-9_])$h\(" "$TMP"; then HOOKS="$HOOKS, $h"; fi
done

{
  [ -n "$HEADER" ] && printf '%s\n\n' "$HEADER"
  if [ -n "$HOOKS" ]; then
    printf 'import React, {%s } from "%s/react.js";\n' "${HOOKS#,}" "$PREFIX"
  else
    printf 'import React from "%s/react.js";\n' "$PREFIX"
  fi
  sh .claude/genimports.sh "$TMP" "$PREFIX"
  printf '\n'
  cat "$TMP"
  printf '\nexport default %s;\n' "$NAME"
} > "$OUT"

rm -f "$TMP"
echo "wrote $OUT ($(wc -l < "$OUT") lines)"
