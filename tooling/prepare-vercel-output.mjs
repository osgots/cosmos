import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = process.cwd();
const source = resolve(repositoryRoot, "apps/web/dist");
const destination = resolve(repositoryRoot, "dist");

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

console.log("Prepared Vercel output at ./dist");
