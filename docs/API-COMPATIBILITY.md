# Public API and Package Compatibility

**Review type:** static source review  
**Reviewed:** 2026-10-24  
**Scope:** `package.json`, `src/index.ts`, `src/http.ts`, `.github/workflows/ci.yml`  
**Important:** this document records source-observed facts; it does not claim that CI ran or that a package was published.

## Package metadata observed

| Property | Source-observed value |
|---|---|
| Package | `ocode-js` |
| Version | `0.1.0` |
| Module format | ESM (`"type": "module"`) |
| Minimum Node.js | `>=18` |
| Runtime dependencies | None declared |
| TypeScript | Strict compiler configuration |
| Build output | `dist/` with JavaScript and declaration files |
| npm release | README says not yet published |

The `package.json` export map defines the root entry point and these subpaths:

| Import path | Module |
|---|---|
| `ocode-js` | root exports |
| `ocode-js/string` | string helpers |
| `ocode-js/object` | object helpers |
| `ocode-js/async` | asynchronous helpers |
| `ocode-js/url` | URL helpers |
| `ocode-js/validation` | validation helpers |
| `ocode-js/http` | HTTP and JSON request helpers |
| `ocode-js/browser` | browser storage helpers |
| `ocode-js/env` | environment helpers |
| `ocode-js/logger` | logger helpers |

The root barrel `src/index.ts` re-exports each of those modules and declares `OCODE_VERSION = "0.1.0"` and `OCODE_NAME = "OCode.js"`.

## HTTP API observations

The inspected `src/http.ts` exports `fetchJson`, `jsonHeaders` and `jsonRequest`, plus the `FetchJsonOptions` type.

- `fetchJson` rejects invalid `timeoutMs` values before calling fetch.
- When a timeout is configured, an internal `AbortController` is used and its timer is cleared in `finally`.
- Caller cancellation is forwarded to the internal controller when timeout mode is enabled.
- Non-2xx responses throw by default; the response body excerpt is capped at 300 characters.
- JSON parsing errors become `TypeError` instances with the parse failure as the cause.
- The generic response type is compile-time only; it does not perform runtime schema validation.
- `jsonRequest` builds a `RequestInit`; it does not issue the request itself.

See [API Reference](API.md) and [HTTP and Testing Guide](HTTP-AND-TESTING.md).

## Verification still required

This static review does not prove the tests pass. The next validation run should verify:

1. Clean dependency installation and TypeScript build.
2. Existing unit tests.
3. HTTP timeout, abort, invalid JSON, HTTP error and header edge cases.
4. Coverage report generation.
5. Package dry run and root/subpath import smoke tests.
6. Local Markdown link checker against the actual checkout.

Use GitHub Actions results for the exact commit before marking any item test-verified. Do not infer a successful run from a workflow file existing in the repository.
