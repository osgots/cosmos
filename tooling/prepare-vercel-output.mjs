import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolingDirectory = dirname(
  fileURLToPath(import.meta.url)
);

const repositoryRoot = resolve(
  toolingDirectory,
  ".."
);

const source = resolve(
  repositoryRoot,
  "apps/web/dist"
);

const destination = resolve(
  repositoryRoot,
  "dist"
);

await rm(destination, {
  recursive: true,
  force: true
});

await mkdir(destination, {
  recursive: true
});

await cp(source, destination, {
  recursive: true
});

console.log(
  `Prepared Vercel output at ${destination}`
);
