import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// naive ESM->CJS wrapper creator for default Node fetch-compatible envs
export async function buildCjs() {
  const esmPath = resolve("dist/index.js");
  const cjsPath = resolve("dist/index.cjs");
  const code = await readFile(esmPath, "utf8");
  await mkdir(dirname(cjsPath), { recursive: true });
  
  const wrapped = `"use strict";
const nominatim = require("./providers/nominatim.js");
const ipapi = require("./providers/ipapi.js");
const types = require("./types.js");

module.exports = {
  geocodeNominatim: nominatim.geocodeNominatim,
  reverseGeocodeNominatim: nominatim.reverseGeocodeNominatim,
  geocodePlace: nominatim.geocodePlace,
  lookupIp: ipapi.lookupIp,
  ...types
};`;
  await writeFile(cjsPath, wrapped, "utf8");

  // Build CLI CJS wrapper with shebang
  const cliEsmPath = resolve("dist/cli.js");
  const cliCjsPath = resolve("dist/cli.cjs");
  const cliCode = await readFile(cliEsmPath, "utf8");
  
  // Convert ESM imports to CJS requires
  const cjsCode = cliCode
    .replace(/import { geocodePlace } from "\.\/index";/g, 'const { geocodePlace } = require("./index.cjs");')
    .replace(/import { geocodePlace } from "\.\/index\.js";/g, 'const { geocodePlace } = require("./index.cjs");');
  
  const cliWrapped = `#!/usr/bin/env node\n\n"use strict";\n(async () => { ${cjsCode} })();\n`;
  await writeFile(cliCjsPath, cliWrapped, "utf8");
}
