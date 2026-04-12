## Contributing

### Updating the pnpm allowlist

When a dependency build script needs to be allowed to run (for example `esbuild`, `sharp`, etc.), follow this process:

1. Generate the allowlist locally:

```bash
pnpm approve-builds --json > .pnpm/allow-builds.json
```

2. Verify installs and tests locally:

```bash
npx pnpm@10 install --frozen-lockfile
npx pnpm@10 test
```

3. Open a pull request with a clear rationale for the change. The `.pnpm/allow-builds.json` file is code-reviewed and protected by `CODEOWNERS`.

4. CI will assert the allowlist file and project config are present before running installs.

If you have questions, mention the repo owners in the PR.
