import { readFile } from "node:fs/promises";
import { config } from "../../../config";

const patternsCache = {
  patterns: [] as RegExp[],
  lastLoaded: 0,
};

const RELOAD_INTERVAL_MS = 5_000;

export const loadPatterns = async () => {
  const now = Date.now();

  if (now - patternsCache.lastLoaded < RELOAD_INTERVAL_MS) {
    return patternsCache.patterns;
  }

  let content: string;

  try {
    content = await readFile(config.regexPatternsPath, "utf-8");
  } catch {
    patternsCache.lastLoaded = now;
    patternsCache.patterns = [];

    return patternsCache.patterns;
  }

  const patterns = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      try {
        return new RegExp(line, "i");
      } catch (err) {
        console.log(`[warn] invalid regex pattern skipped: ${JSON.stringify(line)}`);
        console.trace(err);
        return null;
      }
    })
    .filter((pattern): pattern is RegExp => pattern !== null);

  patternsCache.lastLoaded = now;
  patternsCache.patterns = patterns;

  return patternsCache.patterns;
};
