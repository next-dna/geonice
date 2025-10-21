import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
// naive ESM->CJS wrapper creator for default Node fetch-compatible envs
export async function buildCjs() {
  const esmPath = resolve("dist/index.js");
  const cjsPath = resolve("dist/index.cjs");
  const code = await readFile(esmPath, "utf8");
  await mkdir(dirname(cjsPath), { recursive: true });
  const wrapped = `"use strict";\nconst m = await (async () => { ${code}\nreturn exports; })();\nmodule.exports = m;`;
  await writeFile(cjsPath, wrapped, "utf8");
}
