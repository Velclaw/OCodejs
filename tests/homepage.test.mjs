import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
const css = html.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? "";
const attrs = (source) => Object.fromEntries([...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
const tags = (tag, source = html) => [...source.matchAll(new RegExp("<" + tag + "\\b([^>]*)>", "gi"))].map(m => attrs(m[1]));
const plain = (source) => source.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

test("documentation page declares Vietnamese, UTF-8, viewport and OCode.js metadata", () => {
  assert.match(html, /^\s*<!doctype html>/i);
  assert.equal(tags("html")[0]?.lang, "vi");
  assert.match(html, /<meta\s+charset=["']utf-8["']/i);
  assert.match(html, /<meta\s+name=["']viewport["']\s+content=["']width=device-width,initial-scale=1["']/i);
  assert.match(html, /<title>OCode\.js Docs/i);
  assert.match(html, /name=["']description["'][^>]*OCode\.js/i);
});

test("page has accessible sidebar navigation, main content and footer", () => {
  assert.match(body, /<aside\b[^>]*aria-label=["']Điều hướng tài liệu["']/i);
  assert.match(body, /<main\b/i);
  assert.match(body, /<footer\b/i);
  assert.match(body, /<nav\b[^>]*aria-label=/i);
  assert.match(body, /<h1\b/i);
  assert.match(body, /OCODE/i);
});

test("sidebar fragment links point to unique existing section targets", () => {
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  const links = [...body.matchAll(/<a\b([^>]*)>/gi)].map(m => attrs(m[1])).filter(a => a.href?.startsWith("#"));
  assert.ok(links.length >= 5, "Expected sidebar section navigation");
  for (const link of links) assert.ok(ids.includes(decodeURIComponent(link.href.slice(1))), "Broken fragment: " + link.href);
});

test("documentation includes getting started, architecture, API and form examples", () => {
  for (const id of ["guide", "architecture", "api", "forms"]) {
    assert.ok(html.includes('id="' + id + '"'), "Missing documentation section: " + id);
  }
  assert.match(plain(html), /Hướng dẫn bắt đầu/i);
  assert.match(plain(html), /Kiến trúc/i);
  assert.match(plain(html), /API reference/i);
  assert.match(html, /id=["']feedbackForm["']/);
});

test("sidebar has a mobile toggle, overlay and Escape-key support", () => {
  assert.match(html, /id=["']sidebarToggle["']/);
  assert.match(html, /id=["']sidebarOverlay["']/);
  assert.match(html, /event\.key\s*===\s*['"]Escape['"]/);
  assert.match(css, /@media\s*\(max-width:\s*\d+px\)/);
});

test("copy controls use data-copy and expose feedback when clipboard access fails", () => {
  assert.match(html, /data-copy=/);
  assert.match(html, /navigator\.clipboard\.writeText/);
  assert.match(html, /Không thể sao chép/);
  assert.match(html, /Đã sao chép/);
});

test("feedback form has labels, fields and prevents accidental navigation", () => {
  assert.match(html, /id=["']feedbackForm["']/);
  assert.match(html, /<label\b/i);
  assert.match(html, /name=["']message["']/);
  assert.match(html, /event\.preventDefault\(\)/);
  assert.match(html, /id=["']formNote["']/);
});

test("static docs have responsive and reduced-motion styles without external runtime assets", () => {
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(html, /<script\b[^>]*src=["']https?:/i);
  assert.doesNotMatch(html, /<link\b[^>]*href=["']https?:[^"']*\.css/i);
});

test("project links use HTTPS and target the declared OCodejs repository", () => {
  const external = [...body.matchAll(/<a\b([^>]*)>/gi)].map(m => attrs(m[1])).filter(a => /^https?:/i.test(a.href ?? ""));
  assert.ok(external.some(a => a.href === "https://github.com/Velclaw/OCodejs"), "Missing repository link");
  for (const link of external) {
    assert.equal(new URL(link.href).protocol, "https:");
    if (link.target === "_blank") assert.match(link.rel ?? "", /noreferrer|noopener/i);
  }
});

test("local PDF reference resolves to a file or an explicit remote document URL", () => {
  const pdf = [...body.matchAll(/<a\b([^>]*)>/gi)].map(m => attrs(m[1])).find(a => /\.pdf(?:$|[?#])/i.test(a.href ?? ""));
  assert.ok(pdf, "Expected a brand brief PDF link");
  if (!/^https:\/\//i.test(pdf.href)) assert.ok(existsSync(new URL(pdf.href, root)), "Missing local PDF: " + pdf.href);
});
