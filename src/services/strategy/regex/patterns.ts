import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../../../config";

const patternsCache = {
  patterns: [] as RegExp[],
  lastLoaded: 0,
};

const RELOAD_INTERVAL_MS = 5_000;

const parsePatterns = (content: string): RegExp[] =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      try {
        return new RegExp(line, "i");
      } catch (err) {
        console.log(
          `[warn] invalid regex pattern skipped: ${JSON.stringify(line)}`,
        );
        console.trace(err);
        return null;
      }
    })
    .filter((pattern): pattern is RegExp => pattern !== null);

export const loadPatterns = async () => {
  const now = Date.now();

  if (now - patternsCache.lastLoaded < RELOAD_INTERVAL_MS) {
    return patternsCache.patterns;
  }

  let files: string[];

  try {
    files = await readdir(config.regexPatternsDir);
  } catch {
    patternsCache.lastLoaded = now;
    patternsCache.patterns = [];

    return patternsCache.patterns;
  }

  const patternsFileNames = files.filter((name) =>
    name.toLowerCase().endsWith(".txt"),
  );

  const patterns: RegExp[] = [];

  for (const name of patternsFileNames) {
    try {
      const content = await readFile(
        join(config.regexPatternsDir, name),
        "utf-8",
      );
      patterns.push(...parsePatterns(content));
    } catch (err) {
      console.log(
        `[warn] couldn't read regex patterns file ${JSON.stringify(name)}`,
      );
      console.trace(err);
    }
  }

  patternsCache.lastLoaded = now;
  patternsCache.patterns = patterns;

  return patternsCache.patterns;
};
