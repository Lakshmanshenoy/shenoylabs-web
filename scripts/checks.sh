
#!/usr/bin/env bash
set -euo pipefail

PROG_NAME=$(basename "$0")
usage() {
  cat <<EOF
Usage: $PROG_NAME [--ci] [--fast] [--fix] [--install] [--help]

Options:
  --ci        Run CI-mode (includes tests + build)
  --fast      Use faster lint options (cache-enabled)
  --fix       Attempt auto-fix where supported (eslint, prettier)
  --install   Install dependencies before running checks
  --help      Show this help
EOF
}

CI=false
FAST=false
FIX=false
INSTALL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ci) CI=true; shift ;;
    --fast) FAST=true; shift ;;
    --fix) FIX=true; shift ;;
    --install) INSTALL=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

# Choose package manager: prefer pnpm, fall back to yarn/npm
if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
elif command -v yarn >/dev/null 2>&1; then
  PKG_MANAGER="yarn"
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
else
  echo "No package manager found (pnpm/yarn/npm). Aborting." >&2
  exit 1
fi

echo "Using package manager: $PKG_MANAGER"
echo "Node: $(node -v 2>/dev/null || echo 'node not found')"
echo "$PKG_MANAGER: $($PKG_MANAGER -v 2>/dev/null || echo 'version unknown')"

# Optionally install deps (useful in CI)
if [ "$INSTALL" = true ] || [ "$CI" = true ]; then
  echo "Installing dependencies..."
  if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm install --frozen-lockfile
  elif [ "$PKG_MANAGER" = "yarn" ]; then
    yarn install --frozen-lockfile || yarn
  else
    npm ci || npm install
  fi
fi

mkdir -p reports
failures=0

run_cmd() {
  local name="$1"; shift
  local out="reports/${name}.log"
  echo "---- $name ----"
  if "$@" > "$out" 2>&1; then
    echo "$name: OK"
    return 0
  else
    echo "$name: FAIL (see $out)"
    failures=$((failures+1))
    return 1
  fi
}

# ESLint
ESLINT_BASE=( . --ext .js,.jsx,.ts,.tsx )
ESLINT_ARGS=( --cache --cache-location .eslintcache )
if [ "$FAST" = true ]; then
  ESLINT_ARGS+=( --cache )
fi
if [ "$FIX" = true ]; then
  # prefer eslint --fix when requested
  ESLINT_ARGS+=( --fix )
fi

# Run ESLint directly (use local binary) to avoid npm/pnpm argument forwarding
# which can insert a `--` that causes ESLint to treat subsequent args as file patterns.
ESLINT_BIN="$(pwd)/node_modules/.bin/eslint"
if [ -x "$ESLINT_BIN" ]; then
  run_cmd eslint "$ESLINT_BIN" "${ESLINT_BASE[@]}" "${ESLINT_ARGS[@]}"
else
  # fallback to npx if local binary isn't present
  run_cmd eslint npx eslint "${ESLINT_BASE[@]}" "${ESLINT_ARGS[@]}"
fi

# TypeScript type-check
run_cmd typescript "$PKG_MANAGER" run typecheck

# Prettier (optional) — only run if configured in package.json
if grep -q '"prettier"' package.json 2>/dev/null; then
  if [ "$FIX" = true ]; then
    run_cmd prettier npx prettier --write .
  else
    run_cmd prettier npx prettier --check .
  fi
else
  echo "Prettier not configured in package.json — skipping prettier checks"
fi

# CI-mode: run tests and build (strict)
if [ "$CI" = true ]; then
  if grep -q '"test"' package.json 2>/dev/null; then
    run_cmd tests "$PKG_MANAGER" run test -- --run || run_cmd tests "$PKG_MANAGER" run test
  else
    echo "No test script configured — skipping tests"
  fi

  if grep -q '"build"' package.json 2>/dev/null; then
    run_cmd build "$PKG_MANAGER" run build
  else
    echo "No build script configured — skipping build"
  fi
fi

if [ "$failures" -ne 0 ]; then
  echo "$failures checks failed — see reports/ for details"
  exit 1
else
  echo "All checks passed"
  exit 0
fi
#!/usr/bin/env bash
set -euo pipefail

# Run from repo root
cd "$(dirname "$0")/.."

# Detect package manager
if command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif command -v npm >/dev/null 2>&1; then
  PM=npm
else
  echo "Error: neither pnpm nor npm found in PATH. Install one to run checks."
  exit 2
fi

echo "Using package manager: $PM"

# Ensure dependencies are installed (do not auto-install to avoid long runs)
if [ ! -d node_modules ] && [ ! -d .pnpm ]; then
  echo "Dependencies not installed. Please run '$PM install' then re-run this script."
  exit 2
fi

echo "Running ESLint..."
${PM} run lint

echo "Running TypeScript typecheck..."
${PM} run typecheck

echo "All checks passed."
