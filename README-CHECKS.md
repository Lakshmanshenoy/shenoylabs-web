Checks script
=============

This repository includes a helper script at `scripts/checks.sh` to run local developer checks.

Usage
-----

Run via the npm script:

```bash
pnpm run check
# or
npm run check
```

The script supports a few flags:

- `--ci` — run in CI mode (includes tests and build)
- `--fast` — enable faster lint options (cache)
- `--fix` — attempt auto-fixes where supported (eslint, prettier)
- `--install` — install dependencies before running checks

Outputs
-------

Logs are written into `reports/` as `eslint.log`, `typescript.log`, `prettier.log`, `tests.log`, and `build.log` when those checks run.
