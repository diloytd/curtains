/**
 * Копирует/качает картинки и иконки (upload + image/svg в local/templates)
 * в public/catalog/shtori/media/ и переписывает ссылки без двойных замен.
 */
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const htmlPath = path.join(publicDir, "catalog", "shtori", "index.html");
const mediaRoot = path.join(publicDir, "catalog", "shtori", "media");
const baseUrl = "https://www.karniz.ru";

const isImagePath = (p) =>
  /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)(\?[^"'\\s)]*)?$/i.test(p);

const normalizePath = (raw) => {
  let s = raw.trim();
  if (s.startsWith("https://www.karniz.ru")) {
    s = s.slice("https://www.karniz.ru".length);
  } else if (s.startsWith("http://www.karniz.ru")) {
    s = s.slice("http://www.karniz.ru".length);
  }
  if (s.startsWith("/")) s = s.slice(1);
  while (s.startsWith("../")) s = s.slice(3);
  return s.split("?")[0];
};

const collectPathsFromHtml = (html) => {
  const set = new Set();
  const addRaw = (raw) => {
    const n = normalizePath(raw);
    if (!n || n.includes("..")) return;
    if (!isImagePath(n)) return;
    if (n.startsWith("upload/")) {
      set.add(n);
      return;
    }
    if (n.startsWith("local/templates/")) {
      set.add(n);
    }
  };

  for (const m of html.matchAll(/(?:data-src|data-bg|data-original|href|src|content)=["']([^"']+)["']/gi)) {
    if (!m[1].startsWith("data:")) addRaw(m[1]);
  }
  for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    addRaw(m[1]);
  }
  for (const m of html.matchAll(/https:\/\/www\.karniz\.ru\/(upload\/[^\s"'<>)]+)/gi)) {
    addRaw(m[0]);
  }
  for (const m of html.matchAll(/https:\/\/www\.karniz\.ru\/(local\/templates\/[^\s"'<>)]+)/gi)) {
    addRaw(m[0]);
  }
  for (const m of html.matchAll(/\/(upload\/[^\s"'<>)]+)/g)) {
    addRaw(`/${m[1]}`);
  }
  for (const m of html.matchAll(/\.\.\/\.\.\/(upload\/[^\s"'<>)]+)/g)) {
    addRaw(m[0]);
  }
  for (const m of html.matchAll(/\.\.\/\.\.\/(local\/templates\/[^\s"'<>)]+)/g)) {
    addRaw(m[0]);
  }
  return [...set].sort((a, b) => b.length - a.length);
};

const ensureDir = (filePath) => {
  mkdirSync(path.dirname(filePath), { recursive: true });
};

const resolveLocalSource = (relPath) => {
  const p = path.join(publicDir, ...relPath.split("/"));
  return existsSync(p) ? p : null;
};

const fetchToFile = async (url, dest) => {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  ensureDir(dest);
  writeFileSync(dest, buf);
};

const main = async () => {
  let html = readFileSync(htmlPath, "utf8");
  const relPaths = collectPathsFromHtml(html);
  console.log(`Уникальных путей к картинкам/иконкам: ${relPaths.length}`);

  let copied = 0;
  let fetched = 0;
  const missing = [];

  for (const rel of relPaths) {
    const dest = path.join(mediaRoot, ...rel.split("/"));
    const local = resolveLocalSource(rel);
    try {
      if (local) {
        ensureDir(dest);
        copyFileSync(local, dest);
        copied++;
      } else {
        const url = `${baseUrl}/${rel.replace(/^\/+/, "")}`;
        await fetchToFile(url, dest);
        fetched++;
      }
    } catch (e) {
      missing.push({ rel, error: String(e.message || e) });
    }
  }

  const rewriteHtml = (h) => {
    let s = h;
    s = s.replaceAll('data-src="/upload/', 'data-src="media/upload/');
    s = s.replaceAll('data-srcset="/upload/', 'data-srcset="media/upload/');
    s = s.replaceAll(`href="${baseUrl}/upload/`, `href="media/upload/`);
    s = s.replaceAll(`content="${baseUrl}/upload/`, `content="media/upload/`);
    s = s.replaceAll(`link rel="image_src" href="${baseUrl}/upload/`, `link rel="image_src" href="media/upload/`);
    s = s.replaceAll(`<link rel="apple-touch-icon" sizes="180x180" href="${baseUrl}/upload/`, `<link rel="apple-touch-icon" sizes="180x180" href="media/upload/`);
    s = s.replaceAll("url('../../upload/", "url('media/upload/");
    s = s.replaceAll('url("../../upload/', 'url("media/upload/');
    s = s.replaceAll('background-image:url(\'../../upload/', "background-image:url('media/upload/");
    s = s.replaceAll('background-image:url("../../upload/', 'background-image:url("media/upload/');
    s = s.replaceAll(
      'src="../../local/templates/aspro_max_grch/images/',
      'src="media/local/templates/aspro_max_grch/images/',
    );
    s = s.replaceAll(
      'xlink:href="../../local/templates/aspro_max_grch/images/',
      'xlink:href="media/local/templates/aspro_max_grch/images/',
    );
    return s;
  };

  html = rewriteHtml(html);

  writeFileSync(htmlPath, html, "utf8");

  console.log(`Скопировано локально: ${copied}, скачано: ${fetched}`);
  if (missing.length) {
    console.warn("Не удалось:", missing.length);
    for (const m of missing.slice(0, 15)) console.warn(" ", m.rel, m.error);
    if (missing.length > 15) console.warn(`  ... ещё ${missing.length - 15}`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
