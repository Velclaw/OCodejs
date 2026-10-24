# HTTP Utilities and Testing Guide

This guide documents the current `src/http.ts` implementation in OCode.js. It is a usage guide, not evidence that external services or production endpoints have been tested.

## Available exports

The HTTP module currently exports:

- `fetchJson<T>(input, init?)`
- `jsonHeaders(headers?)`
- `jsonRequest<T>(body, init?)`
- `FetchJsonOptions` (TypeScript interface)

Import them from `ocode-js/http`. The package has not been published to npm according to the project README; during development, build the repository first.

## Request with a deadline

```ts
import { fetchJson } from "ocode-js/http";

type StatusPayload = { status: string };

const payload = await fetchJson<StatusPayload>(
  "https://example.com/api/status",
  {
    headers: { Accept: "application/json" },
    timeoutMs: 4_000,
  },
);
```

`timeoutMs` must be a positive, finite number. The implementation creates an internal `AbortController` when a timeout is configured, aborts the fetch at the deadline, and clears the timer in a `finally` block. A timeout error is reported as `Request timed out after Nms`.

The generic type parameter is compile-time guidance only. It does not validate the JSON response at runtime. Validate untrusted responses with an application schema before relying on their shape.

## Caller cancellation

```ts
import { fetchJson } from "ocode-js/http";

const controller = new AbortController();

const pending = fetchJson("https://example.com/api/data", {
  signal: controller.signal,
  timeoutMs: 4_000,
});

// Call controller.abort() when the user navigates away or cancels.
```

When both `signal` and `timeoutMs` are supplied, the implementation forwards caller cancellation to its internal controller. If no timeout is configured, the caller's signal is passed to `fetch` directly. Always handle rejection from the pending promise.

## HTTP errors and invalid JSON

By default, `throwOnHttpError` is `true`. A non-success response throws an error containing the HTTP status and status text; up to 300 characters of the response body may be included. Do not put secrets or personal information in error bodies, and avoid returning raw errors to end users.

Set `throwOnHttpError: false` only when the application intentionally needs to parse JSON from non-2xx responses. The helper still attempts JSON parsing, and malformed or empty JSON produces a `TypeError` with the parsing cause.

Network failures and caller-triggered aborts are propagated; handle them at the call site.

## JSON headers and request bodies

```ts
import { jsonHeaders, jsonRequest } from "ocode-js/http";

const headers = jsonHeaders({ Authorization: "Bearer example-token" });
const init = jsonRequest(
  { title: "Example" },
  { method: "POST", headers },
);
```

- `jsonHeaders` returns a `Headers` object. It adds `Accept: application/json` and `Content-Type: application/json` only if those headers are absent.
- `jsonRequest` returns a `RequestInit`; it does not send a network request. It JSON-serializes the body and applies JSON header defaults while preserving other init options.
- If `JSON.stringify` returns `undefined`, `jsonRequest` throws a `TypeError`.

Never hard-code real credentials in examples. Use a secret manager or server environment configuration for actual authorization tokens.

## Test strategy

The HTTP implementation depends on the standard `fetch`, `AbortController`, `Headers`, `RequestInit` and timer APIs. Unit tests should use controlled local mocks rather than real third-party services.

Recommended cases:

| Area | Case | Expected behavior |
|---|---|---|
| Timeout validation | zero, negative, `NaN`, positive infinity | Reject with `RangeError` before issuing a request |
| Successful response | valid JSON and 2xx status | Resolve to parsed JSON |
| HTTP failure | non-2xx with default options | Reject with status and status text |
| HTTP failure opt-out | non-2xx plus `throwOnHttpError: false`, valid JSON | Resolve to parsed JSON |
| Invalid body | malformed or empty JSON | Reject with `TypeError` |
| Network failure | mocked `fetch` rejects | Propagate rejection |
| Deadline | fetch rejects after the internal signal aborts | Reject with timeout error and configured duration |
| Caller cancellation | caller signal aborts with timeout enabled | Abort internal request and reject |
| Cleanup | success, failure, timeout | Clear timeout and remove abort listener |
| Header defaults | no supplied headers | Add JSON Accept and Content-Type |
| Header preservation | custom Accept or Content-Type | Preserve explicitly supplied values |
| Request serialization | JSON-compatible body | Return serialized body and merged init |
| Unsupported body | body serializes to `undefined` | Throw `TypeError` |

### Running the current checks

From a clean checkout:

```bash
npm install
npm run build
npm test
npm run test:coverage
```

The commands above are documented in `package.json`. This guide does not claim that they were run during this documentation change. Review the CI run for the commit before treating a test case as passed.

## Security notes

- Never include actual tokens in committed examples, tests, snapshots, or CI logs.
- Do not use `fetchJson<T>` as a substitute for runtime schema validation.
- Avoid automatically retrying non-idempotent writes unless the server supports an idempotency mechanism.
- Use HTTPS for real service calls and enforce authentication and authorization in the application/server.
