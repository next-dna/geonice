import { buildCjs } from "./utils/build-cjs";
import { execSync } from "node:child_process";

// Build main library
await buildCjs();

// Build CLI
execSync(
  "tsc src/cli.ts --outDir dist --target ES2022 --module ES2022 --moduleResolution bundler",
  { stdio: "inherit" },
);

// Build server
execSync(
  "tsc src/server.ts --outDir dist --target ES2022 --module ES2022 --moduleResolution bundler",
  { stdio: "inherit" },
);

// Build config
execSync(
  "tsc src/config.ts --outDir dist --target ES2022 --module ES2022 --moduleResolution bundler",
  { stdio: "inherit" },
);
