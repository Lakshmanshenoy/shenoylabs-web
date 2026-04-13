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
