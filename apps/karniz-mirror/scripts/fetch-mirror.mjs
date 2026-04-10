import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const tmpDir = path.join(root, "mirror-tmp");
const wgetCandidates = [
  process.env.WGET_PATH,
  "wget",
  "C:\\OSPanel\\bin\\wget.exe",
].filter(Boolean);

const resolveWget = () => {
  for (const c of wgetCandidates) {
    if (c.endsWith(".exe") && existsSync(c)) return c;
  }
  return wgetCandidates[0] ?? "wget";
};

const wget = resolveWget();

const args = [
  "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "-E",
  "-H",
  "-k",
  "-K",
  "-p",
  "-e",
  "robots=off",
  "--restrict-file-names=windows",
  "--timeout=30",
  "--tries=3",
  "https://www.karniz.ru/catalog/shtori/",
];

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

const result = spawnSync(wget, args, {
  cwd: tmpDir,
  stdio: "inherit",
  shell: false,
});

// wget: 0 OK, 8 — частичные ошибки (404 и т.п.), остальное — фатально
const code = result.status ?? 1;
if (code !== 0 && code !== 8) {
  process.exit(code);
}

const srcRoot = path.join(tmpDir, "www.karniz.ru");
if (!existsSync(srcRoot)) {
  console.error("Не найдена папка www.karniz.ru после wget.");
  process.exit(1);
}

const publicDir = path.join(root, "public");
rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
cpSync(srcRoot, publicDir, { recursive: true });

console.log("Готово: зеркало скопировано в public/");
