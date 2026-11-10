# OCode.js v0.1.0 Release Checklist

Package: `ocode-js`  
Initial version: `0.1.0`  
Repository: https://github.com/Velclaw/OCodejs

## Before release

- [ ] Confirm package name availability and ownership using the npm registry while signed in to the intended publisher account. A search result alone is not proof of publish permission.
- [ ] Confirm the npm account has 2FA/access policy configured as required by npm and that the package will be published under the intended public scope (unscoped package: `--access public`).
- [ ] Create an npm automation/access token with the minimum permissions needed to publish this package. Do not paste the token into source code, issues, PR comments, or chat.
- [ ] Add it as repository Actions secret named `NPM_TOKEN`: Settings → Secrets and variables → Actions → New repository secret.
- [ ] Verify that the workflow can read the secret without printing it. GitHub does not reveal an existing secret's value.
- [ ] Review README/API docs, LICENSE, package exports, supported Node.js version, and the `files` allowlist.
- [ ] Run `npm install --no-audit --no-fund`, `npm test`, `npm run test:coverage`, and `npm pack --dry-run`.
- [ ] Inspect the package tarball contents and ensure no credentials, environment files, tests, private files, or unintended generated files are included.
- [ ] Confirm all required CI checks pass on the release PR and the intended commit is merged to `main`.

## Publish

- [ ] Confirm the package name is still available or already belongs to the intended publisher.
- [ ] Confirm `NPM_TOKEN` is configured and valid; never print it in logs.
- [ ] Tag the approved release commit as `v0.1.0` and push the tag.
- [ ] Verify the tag-triggered GitHub Actions publish workflow succeeds.
- [ ] Verify `npm view ocode-js version` reports `0.1.0` and the package page is accessible.
- [ ] Install the published package in a clean temporary project and smoke-test root and documented subpath exports.

## After release

- [ ] Create a GitHub Release for `v0.1.0` with notes and supported runtime information.
- [ ] Verify npm provenance and published tarball contents.
- [ ] Update README status/installation instructions only after publication is confirmed.
- [ ] Record any failure and stop; do not repeatedly publish or change versions without diagnosing the cause.

## Safety gates

- Do not publish from an unreviewed branch or while CI is failing.
- Do not commit or disclose `NPM_TOKEN`.
- Do not create paid resources or modify production infrastructure for this release.
- A green CI run, a pushed tag, or a created GitHub Release alone does not prove that npm publication succeeded.
