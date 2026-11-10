## Summary

IDE integration (`/ide status`, `/ide enable`, open-file context, native
diffs) has never worked when Gemini CLI runs inside a container sandbox
(`GEMINI_SANDBOX=docker|podman|runsc`) while the IDE runs on the host. The
companion extension listens only on the host loopback interface and requires a
per-window bearer token that the launcher deliberately never forwards; under
gVisor (`runsc`) even the `--network host` workaround fails because netstack's
loopback is private to the sandbox.

This PR makes it work **without the token ever entering the sandbox**: the host
launcher (which already runs in the IDE's integrated terminal and can reach the
companion) brokers the MCP session into the container over `docker exec -i` /
`podman exec -i` and a Unix socket inside the container. The CLI inside uses
its existing stdio transport, so no change to the sandbox image is required
beyond `node` being present. The channel doesn't depend on container networking
at all, which is what makes it work under gVisor.

```text
 host                                        container
 ┌────────────────────────────────┐          ┌──────────────────────────────┐
 │ IDE companion  127.0.0.1:P     │          │ gemini (CLI, stdio MCP)      │
 │   ▲ Streamable HTTP + token    │          │   │ GEMINI_CLI_IDE_SERVER_    │
 │   │ (stays on the host)        │          │   ▼   STDIO_COMMAND / _ARGS  │
 │ IdeBridge (MCP server/stdio) ──┼─ exec ───┼─► ide-bridge.js serve ◄──────┼─ ide-bridge.js connect
 │   • openDiff/closeDiff only    │  pipe    │   (Unix socket in /tmp)      │
 │   • filePath ⊆ IDE workspace   │          └──────────────────────────────┘
 │   • ide/* notifications        │
 └────────────────────────────────┘
```

## Details

**Why not forward the token?** That would be a sandbox escape: with the
token, sandboxed code can call the companion directly, and `openDiff` accepts
any absolute host path. The broker keeps the credential
on the host, exists only for the lifetime of the sandboxed session, listens on
no network interface, and enforces two things the companion itself does not:
a tool allow-list (`tools/list`, `tools/call` for `openDiff`/`closeDiff`) and
confinement of `filePath` to the IDE workspace folders. Everything else gets a
JSON-RPC error on the host before it reaches the IDE.

**Why `exec` + Unix socket rather than TCP to the host gateway or a bind-mounted
socket?** A gateway listener depends on bridge IP discovery and host firewall
policy, and a bind-mounted host socket needs `--host-uds=open` under gVisor.
`exec` and an in-sandbox socket work with runc, podman and runsc defaults,
regardless of network isolation.

Changes:

- `packages/cli/src/utils/ideBridge.ts` (new) — the host-side broker: MCP
  client to the companion (reusing the CLI's own discovery: connection file,
  then environment) + MCP server over the exec pipe. Retries `exec` while the
  container starts; replays the latest `ide/contextUpdate` to a (re)connecting
  CLI; on companion loss it closes the sandbox session (the CLI shows the usual
  "run `/ide enable`") and re-resolves/reconnects on the next `initialize`, so
  VS Code **Reload Window** is survivable. Never throws into the launcher.
- `packages/cli/src/utils/ideBridgeHelper.ts` (new) — dependency-free script
  embedded as a string and delivered through the already-mounted sandbox temp
  directory: `serve` (socket ↔ exec stdio, one session at a time) and
  `connect` (stdio ↔ socket, retries 30 s while the host attaches).
- `packages/cli/src/utils/sandbox.ts` — connect to the companion **before**
  `docker run`; if reachable, write the helper and inject
  `GEMINI_CLI_IDE_SERVER_STDIO_COMMAND=node` /
  `GEMINI_CLI_IDE_SERVER_STDIO_ARGS=[helper, connect, socket]`.
  `GEMINI_CLI_IDE_SERVER_PORT` is no longer forwarded (it never worked). After
  spawn, attach via `<engine> exec -i [--user uid:gid] <container>`; stop on
  exit, SIGINT and SIGTERM.
- `packages/core` — sandbox-aware connection-failure message (no
  `/ide install` inside a sandbox, where it cannot reach the host IDE); export
  the connection helpers the bridge reuses; `IdeClient.openDiff()` now returns
  the chained `promise.finally(release)` so a rejected diff isn't also an
  unhandled rejection.
- Docs — `docs/ide-integration/index.md` and `docs/cli/sandbox.md`: replace the
  incorrect "Docker connects via `host.docker.internal`" statement with how the
  bridge works, its requirements (extension running when the sandbox starts,
  `node` in the image), a gVisor note and a troubleshooting entry.

Out of scope / follow-ups: LXC (`lxc exec` could reuse the helper); Windows
hosts (container paths are POSIX, so confinement would need the inverse of
`getContainerPath()` — the Windows sandbox already fails the workspace check
today); images older than this change still print the old `/ide install`
wording when no bridge is present.

## Related Issues

Fixes #21331

## How to Validate

**Unit / integration tests** (no container needed)

```bash
npm test -w @google/gemini-cli -- src/utils/ideBridge.test.ts   # 8 tests
npm test -w @google/gemini-cli -- src/utils/sandbox.test.ts     # 48 tests
npm test -w @google/gemini-cli-core -- src/ide/                 # 163 tests
```

`ideBridge.test.ts` runs the **real `IdeClient`** against the real helper
processes over a real Unix socket, the real `IdeBridge`, and a companion
stand-in that enforces the extension's loopback/Host/bearer gates (`docker
exec` is replaced by a node shim). It covers: connect + context replay,
`openDiff` relay and `ide/diffAccepted` resolution, out-of-workspace refusal,
tool allow-list, slow-container retry, and companion restart → `/ide enable`
recovery. It is skipped on Windows (node has no Unix sockets there; the bridge
only ever runs them inside Linux containers).

**End to end** (Linux, Docker; optionally `runsc` registered as a runtime)

1. Open a project in VS Code with the Gemini CLI Companion extension running.
2. From the integrated terminal: `GEMINI_SANDBOX=runsc gemini` (or `docker`).
3. `/ide status` → `🟢 Connected`. Ask for an edit → the diff opens in VS
   Code; accept/reject resolves in the CLI.
4. While it runs: `docker inspect -f '{{json .Config.Env}}' <container>` shows
   `GEMINI_CLI_IDE_SERVER_STDIO_*` and `GEMINI_CLI_IDE_WORKSPACE_PATH` only —
   **no** `GEMINI_CLI_IDE_SERVER_PORT`, **no** `GEMINI_CLI_IDE_AUTH_TOKEN`;
   `ps` shows `docker exec -i --user <uid>:<gid> <container> node
   /home/node/.gemini/ide-bridge.js serve /tmp/gemini-ide-bridge.sock`.
5. Security boundary from inside the sandbox (no VS Code dependency, run with
   `ide.enabled: false` so the socket is free):
   ```bash
   docker exec -i <container> sh -c '(printf "%s\n%s\n%s\n" \
     "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2025-06-18\",\"capabilities\":{},\"clientInfo\":{\"name\":\"probe\",\"version\":\"0\"}}}" \
     "{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}" \
     "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"openDiff\",\"arguments\":{\"filePath\":\"/etc/passwd\",\"newContent\":\"x\"}}}"; sleep 3) \
     | node /home/node/.gemini/ide-bridge.js connect /tmp/gemini-ide-bridge.sock'
   # → {"jsonrpc":"2.0","id":2,"error":{"code":-32602,"message":"... Refusing to open '/etc/passwd' from inside the sandbox: it is outside the IDE workspace"}}
   ```

Verified on a Linux workstation (Docker 29.7, `runsc`) with the launcher
built from this branch and the published sandbox image, under `docker` and
`runsc`, against both a companion stand-in and a live VS Code window: connected
through the bridge in all cases; out-of-workspace `openDiff` refused on the
host (probe above, run inside a gVisor container); no port/token in the
container environment; no leftover containers, `exec` or helper processes
after each session. Rootless podman on that host fails before the CLI starts
(pre-existing uid-mapping limitation), so the podman path is covered by the
launcher unit tests only.

## Pre-Merge Checklist

- [x] Updated relevant documentation and README (if needed)
- [x] Added/updated tests (if needed)
- [x] Noted breaking changes (if any) — none; `GEMINI_CLI_IDE_SERVER_PORT` is no longer forwarded into containers, where it never worked
- [ ] Validated on required platforms/methods:
  - [ ] MacOS
    - [ ] npm run
    - [ ] npx
    - [ ] Docker
    - [ ] Podman
    - [ ] Seatbelt
  - [ ] Windows
    - [ ] npm run
    - [ ] npx
    - [ ] Docker
  - [x] Linux
    - [x] npm run
    - [ ] npx
    - [x] Docker (runc and gVisor/runsc)


