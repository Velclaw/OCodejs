# OCode.js AI Builder — UI prototype

This folder contains an isolated, dependency-free UI prototype for the proposed OCode.js app builder inspired by prompt-to-app workflows.

## Run locally

Open `index.html` in a browser. No package install or build step is required.

## Included

- Responsive builder layout with prompt panel, starter prompts, preview/code tabs, and a sample landing-page preview.
- Client-side interactions to demonstrate the intended workflow.
- Explicit UI copy that marks the prototype as a mock and states that prompts are not sent to a service.

## Not implemented yet

This is **not** a production AI builder and it does not claim feature parity with v0.app. It does not call an AI provider, persist projects, authenticate users, execute generated code in a sandbox, connect GitHub, or create Vercel deployments. The code tab is a static example, not source generated from the prompt.

## Proposed next implementation stages

1. Confirm the app's product boundary and keep this prototype separate from the root `ocode-js` utility package.
2. Create a dedicated Next.js app boundary with strict TypeScript and automated build/test checks.
3. Add a server-side generation route using the Vercel AI SDK or AI Gateway; keep all provider credentials in server-side environment variables.
4. Add user/project persistence and authentication only after selecting the database and auth approach.
5. Render generated output in an isolated preview/sandbox; never execute arbitrary generated code in the main app origin.
6. Add GitHub export and Vercel preview deployment using least-privilege credentials and explicit user confirmation.
7. Add abuse limits, request budgets, input/output validation, logging without secrets, and security tests.
8. Verify Preview deployment and CI before considering any production release.

## Deployment note

The existing Vercel project `ocode-cloud-agent` is connected to this repository and its latest deployment was still building when inspected. This PR deliberately does not change Vercel project settings, environment variables, production domains, or the repository root build configuration. Configure a Preview-only app root after reviewing the project settings and CI results.
