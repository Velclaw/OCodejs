<div align="center">

<img src="assets/ocode-logo-black.gif" alt="OCode.js — animated logo" width="420" />

# OCode.js

### Small utilities. Clear APIs. Zero runtime dependencies.

A lightweight JavaScript / TypeScript utility toolkit for modern applications.

<p>
  <a href="docs/API.md">API Reference</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#tiếng-việt">Tiếng Việt</a> ·
  <a href="https://github.com/Velclaw/OCodejs/issues">Issues</a>
</p>

[![CI](https://github.com/Velclaw/OCodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/Velclaw/OCodejs/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-43853d?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4f8cff.svg)](LICENSE)

**Status:** v0.1.0 · Early development · Not yet published to npm

</div>

---

## What is OCode.js?

OCode.js is a collection of small, composable helpers for common application tasks. It works with JavaScript, TypeScript, Node.js, and web frameworks such as Next.js—without requiring a framework or adding runtime dependencies.

> **Scope:** OCode.js is a utility library. It does not replace Next.js, Vercel, or a full-stack framework.

## Why OCode.js?

- **Zero runtime dependencies** — keep your production dependency tree small.
- **Composable modules** — import only the utilities you need.
- **TypeScript-first** — strict compiler settings and generated type declarations.
- **Practical async helpers** — retry, timeout, sleep, and deduplication.
- **Browser-aware utilities** — storage helpers designed for browser environments.
- **Tested in CI** — automated tests run through GitHub Actions.

## Feature overview

| Module | What it provides |
| --- | --- |
| `string` | Slug generation, case conversion, HTML escaping, safe truncation |
| `object` | Pick / omit, plain-object checks, deep merge, nested-path reads, JSON cloning |
| `async` | Abort-aware sleep, retry with backoff, async deduplication, timeouts |
| `url` | Query updates, URL joining, parsing, tracking-parameter removal |
| `validation` | String, email, HTTP URL, record, and range checks |
| `http` | JSON fetch and request helpers |
| `browser` | Guarded localStorage access and JSON storage helpers |
| `env` | Required / optional environment values and typed parsing |
| `logger` | Lightweight logger with levels and a configurable output sink |

See the [complete API reference](docs/API.md) for function signatures and usage notes.

## Quick start

### Requirements

- Node.js 18 or newer
- npm

### Install from source

The package has **not been published to npm yet**. To try the current source:

```bash
git clone https://github.com/Velclaw/OCodejs.git
cd OCodejs
npm install
npm test
```

After an official npm release, the intended install command will be:

```bash
npm install ocode-js
```

### Example

```ts
import { slugify, retry, withQuery, isHttpUrl } from "ocode-js";

const slug = slugify("Build a better web");
const docsUrl = withQuery("https://example.com/docs", {
  source: "app",
  page: 2,
});

const result = await retry(async () => {
  const response = await fetch("https://example.com/api/status");

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}, { attempts: 3, delayMs: 200 });

console.log({
  slug,
  docsUrl,
  validUrl: isHttpUrl(docsUrl),
  result,
});
```

### Import by module

```ts
import { slugify } from "ocode-js/string";
import { deepMerge } from "ocode-js/object";
import { retry, withTimeout } from "ocode-js/async";
import { withQuery } from "ocode-js/url";
import { fetchJson } from "ocode-js/http";
```

## Using OCode.js with Next.js

OCode.js can be imported into a Next.js application, but it is independent of Next.js.

- General-purpose helpers can be used wherever their runtime requirements are met.
- Browser storage helpers must only be called in the browser.
- Validate untrusted input at application boundaries.
- `escapeHtml` is a basic escaping helper, not a replacement for a context-aware sanitizer for untrusted rich HTML.

See the [Next.js example](examples/nextjs/README.md).

## Development

Run the build and test suite locally:

```bash
npm install
npm run build
npm test
```

Generate a coverage report:

```bash
npm run test:coverage
```

The project uses TypeScript in strict mode and Node.js's built-in test runner. GitHub Actions runs CI for repository changes.

## Roadmap

- [x] Initial TypeScript utility modules
- [x] API documentation baseline
- [x] Automated tests and CI
- [x] Release workflow scaffolding
- [ ] Expand HTTP timeout and error-path tests
- [ ] Increase API test coverage and review coverage reporting
- [ ] Verify npm package availability and release configuration
- [ ] Complete the release checklist before publishing

## Security

- Never commit API keys, access tokens, passwords, private keys, or production environment files.
- Treat external input as untrusted and validate it at application boundaries.
- Report security concerns through the repository's [Issues](https://github.com/Velclaw/OCodejs/issues) page without posting secrets or sensitive data.

## License

OCode.js is licensed under the [MIT License](LICENSE).

---

## Tiếng Việt

OCode.js là bộ tiện ích JavaScript/TypeScript gọn nhẹ, không có dependency lúc chạy, dành cho các tác vụ thường gặp trong ứng dụng web hiện đại. Thư viện có thể dùng độc lập hoặc tích hợp vào dự án Node.js, TypeScript và Next.js.

### Điểm chính

- **Không có runtime dependency:** giảm phụ thuộc khi chạy production.
- **Module độc lập:** import theo từng nhóm chức năng.
- **TypeScript strict:** ưu tiên kiểu dữ liệu rõ ràng và file khai báo kiểu.
- **Tiện ích bất đồng bộ:** retry, timeout, sleep có hỗ trợ hủy và gộp lời gọi trùng.
- **Hỗ trợ trình duyệt:** các hàm storage có kiểm tra môi trường.
- **Có kiểm thử tự động:** chạy test và CI qua GitHub Actions.

### Cài đặt và chạy thử

Hiện tại, package **chưa được phát hành lên npm**. Clone mã nguồn để chạy thử:

```bash
git clone https://github.com/Velclaw/OCodejs.git
cd OCodejs
npm install
npm test
```

Sau khi có bản phát hành chính thức, lệnh cài dự kiến là `npm install ocode-js`.

### Dùng với Next.js

OCode.js **không thay thế Next.js hoặc Vercel**; đây là thư viện tiện ích có thể tích hợp vào dự án Next.js. Chỉ gọi các hàm truy cập `localStorage` ở phía trình duyệt. Hàm `escapeHtml` cơ bản không thay thế bộ HTML sanitizer chuyên dụng khi xử lý HTML không tin cậy.

### Tài liệu và phát triển

- [Tài liệu API](docs/API.md)
- [Ví dụ Next.js](examples/nextjs/README.md)
- [Báo lỗi / đề xuất](https://github.com/Velclaw/OCodejs/issues)

Yêu cầu Node.js 18+. Chạy `npm install`, sau đó `npm test` để build TypeScript và thực thi bộ kiểm thử.

### Lộ trình

- [x] Xây dựng các module tiện ích TypeScript ban đầu
- [x] Bổ sung tài liệu API và CI
- [x] Thiết lập nền tảng kiểm thử tự động
- [ ] Mở rộng kiểm thử timeout và các nhánh lỗi HTTP
- [ ] Tăng độ bao phủ kiểm thử API
- [ ] Xác minh cấu hình npm và hoàn tất checklist phát hành

### Tài nguyên thương hiệu

- [Logo GIF động](assets/ocode-logo.gif)
- [Logo SVG nền trong suốt](assets/ocode-logo.svg)
- [Xem trước logo động](assets/logo-preview.html)

---

<div align="center">

**OCode.js** · Open source · MIT

<sub>Built for clarity. Designed to stay lightweight.</sub>

</div>
