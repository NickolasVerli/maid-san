import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../../../config";

const samplesCache = {
  cachedFilenames: [] as string[],
  lastCached: 0,
};

export const getSamplesFilenames = async () => {
  const now = Date.now();

  if (now - samplesCache.lastCached < 5_000) {
    return samplesCache.cachedFilenames;
  }

  const samplesFilenames = await readdir(config.samplesDir);

  samplesCache.lastCached = now;
  samplesCache.cachedFilenames = samplesFilenames
    .filter((p) => !p.startsWith("."))
    .map((p) => join(config.samplesDir, p));

  return samplesCache.cachedFilenames;
};
