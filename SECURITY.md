# Security and deployment

This is a portfolio demo, not a multi-user production service.

- Keep provider credentials in server environment variables. Never put them in
  `NEXT_PUBLIC_`, `VITE_`, a browser bundle, a ZIP, logs, or Git.
- Set `DEMO_ACCESS_TOKEN` to a randomly generated access code of at least 32
  characters. An unset or short code disables protected operations. Share the
  code only with people you authorize to use the demo; it is not a provider key.
  The browser asks for it when needed and keeps it in memory only.
- `ALLOW_LOCAL_DEMO=true` is an explicit local testing exception. Bind the
  backend to loopback and never enable this exception on a public host.
- Use HTTPS for deployments. Set allowed origins to the actual frontend origin.
- Request limits are per process, not a distributed quota. Before sharing a
  live paid API broadly, add a persistent gateway rate limit and configure the
  provider's usage restrictions and billing alerts.
- Raw provider errors, uploaded data, and model responses must not appear in
  public error responses or logs.
- If a credential was ever committed, revoke/rotate it first. Deleting the file,
  archiving the repository, or making it private does not revoke a credential.
  Coordinate any history rewrite with collaborators; forks and old clones can
  retain the original data.
- Run the security regression tests before merging changes. Tests use fake
  credentials and mocked provider calls; they do not contact paid services.

## AI endpoints

Both /api/process and /api/reanalyze require the demo code, enforce a streamed
1 MiB body limit, and share a six-requests-per-minute per-process cap. Production
never honors ALLOW_LOCAL_DEMO. Gemini requests have a 30-second timeout and an
8,192-token output cap. The public sample dashboard remains available without
the code. DEMO_ACCESS_TOKEN belongs only in the server deployment environment.

Run `npm run test:security` and `npm run build` before deployment.

The scoped minimatch 11.0.1 override patches the ESLint parser dependency without
downgrading Next.js. Remove it once the upstream dependency declares a patched
version. Validate the parser with ESLint when updating it.

