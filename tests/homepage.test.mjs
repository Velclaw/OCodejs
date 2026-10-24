import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));

function attrs(markup) {
  return Object.fromEntries([...markup.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((m) => [m[1].toLowerCase(), m[2] ?? m[3]]));
}
function elements(tag, markup = html) {
  return [...markup.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/\\s*${tag}\\s*>`, "gi"))]
    .map((m) => ({ attributes: attrs(m[1]), content: m[2] }));
}
function text(markup) {
  return markup.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
function one(tag, markup = html) {
  const found = elements(tag, markup);
  assert.equal(found.length, 1, `Expected exactly one <${tag}>`);
  return found[0];
}
function hasId(id) {
  return new RegExp(`\\bid=["']${id}["']`).test(html);
}

test("homepage declares Vietnamese, UTF-8, mobile viewport and project metadata", () => {
  assert.match(html, /^\s*<!doctype html>/i);
  assert.equal(one("html").attributes.lang, "vi");
  const metas = [...html.matchAll(/<meta\b([^>]*)>/gi)].map((m) => attrs(m[1]));
  assert.ok(metas.some((m) => m.charset?.toLowerCase() === "utf-8"));
  assert.equal(metas.find((m) => m.name === "viewport")?.content, "width=device-width,initial-scale=1");
  assert.equal(metas.find((m) => m.name === "theme-color")?.content, "#000000");
  assert.match(metas.find((m) => m.name === "description")?.content ?? "", /OCode\.js/i);
  assert.match(text(one("title").content), /OCode\.js/i);
});

test("documentation page has semantic landmarks, one main heading and named navigation", () => {
  one("header");
  one("footer");
  const main = one("main");
  assert.equal(main.attributes.id, "top");
  assert.equal(elements("h1", main.content).length, 1);
  assert.match(text(one("h1", main.content).content), /Build with OCode\.js\. Keep it precise\./);
  const navs = elements("nav");
  assert.ok(navs.length >= 2);
  for (const nav of navs) {
    assert.ok(nav.attributes["aria-label"]?.trim(), "Every navigation needs an accessible name");
    assert.ok(elements("a", nav.content).length > 0);
  }
});

test("sidebar navigation targets existing sections and supports mobile controls", () => {
  for (const id of ["top", "guide", "architecture", "api", "forms"]) assert.ok(hasId(id), `Missing #${id}`);
  assert.match(html, /id="sidebarToggle"/);
  assert.match(html, /id="sidebarOverlay"/);
  assert.match(html, /event\.key === ['"]Escape['"]/);
  for (const link of elements("a").filter((a) => (a.attributes.href ?? "").startsWith("#"))) {
    const id = decodeURIComponent(link.attributes.href.slice(1));
    assert.ok(id && hasId(id), `Broken fragment link: #${id}`);
  }
});

test("project links use the repository URL declared by package metadata", () => {
  const repo = new URL(manifest.repository.url.replace(/^git\+/, "").replace(/\.git$/, ""));
  const links = elements("a").filter((a) => /^https?:/i.test(a.attributes.href ?? ""));
  assert.ok(links.length > 0);
  for (const link of links) {
    const url = new URL(link.attributes.href);
    assert.equal(url.protocol, "https:");
    if (url.origin === repo.origin) {
      assert.equal(url.pathname.replace(/\/$/, ""), repo.pathname);
    } else {
      assert.equal(url.href, "https://zskbot.github.io/docs-ocodejs/OCodejs-by-Velclaw-Full-Rebrand.pdf");
    }
    if (link.attributes.target === "_blank") assert.match(link.attributes.rel ?? "", /\bnoreferrer\b/);
  }
});

test("documentation sections explain setup, architecture, API and forms without claiming unfinished features", () => {
  for (const id of ["guide", "architecture", "api", "forms"]) {
    const section = elements("section").find((s) => s.attributes.id === id);
    assert.ok(section, `Missing section ${id}`);
    assert.ok(text(section.content).length > 80, `Section ${id} is unexpectedly empty`);
  }
  assert.match(text(elements("section").find((s) => s.attributes.id === "architecture").content), /khung kiến trúc tham chiếu/i);
  assert.match(text(elements("section").find((s) => s.attributes.id === "api").content), /không khẳng định tính năng đã phát hành/i);
});

test("local links in the HTML resolve to repository files", () => {
  const links = elements("a");
  for (const link of links) {
    const href = link.attributes.href;
    assert.ok(href?.trim(), "Every link needs a destination");
    assert.ok(link.attributes["aria-label"]?.trim() || text(link.content), `Unnamed link: ${href}`);
    assert.doesNotMatch(href, /^(?:javascript|data):/i);
    if (href.startsWith("#") || /^[a-z][\w+.-]*:/i.test(href)) continue;
    assert.ok(!href.startsWith("/"), `Local link must work under a subdirectory: ${href}`);
    const target = new URL(href.split("#")[0].split("?")[0], root);
    assert.ok(existsSync(target), `Missing local target: ${href}`);
  }
});

test("dark visual system, keyboard focus and reduced-motion support remain present", () => {
  assert.match(html, /color-scheme:\s*dark/);
  assert.match(html, /--bg:\s*#000/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:\s*reduce/);
  assert.match(html, /--sidebar-width:\s*248px/);
  assert.match(html, /border:\s*1px solid/);
});

test("feedback form is explicitly a local preview and does not submit to a server", () => {
  one("form");
  assert.match(html, /id="feedbackForm"/);
  assert.match(html, /Demo chỉ hiển thị bản xem trước trong trình duyệt; không gửi hoặc lưu thông tin/);
  assert.match(html, /event\.preventDefault\(\)/);
  assert.match(html, /id="formNote"/);
});

test("no external stylesheet or remote CSS import is required", () => {
  assert.doesNotMatch(html, /<link\b[^>]*\brel=["']stylesheet["']/i);
  assert.doesNotMatch(one("style").content, /@import\b|url\s*\(\s*["']?https?:/i);
});
