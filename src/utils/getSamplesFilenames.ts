import { readdir } from "node:fs/promises";
import { join } from "node:path";

const samplesCache = {
  cachedFilenames: [] as string[],
  lastCached: 0,
};

export const getSamplesFilenames = async () => {
  const now = Date.now();

  if (now - samplesCache.lastCached < 5_000) {
    return samplesCache.cachedFilenames;
  }

  const samplesPath = join(__dirname, "..", "..", "assets", "samples");

  const samplesFilenames = await readdir(samplesPath);

  samplesCache.lastCached = now;
  samplesCache.cachedFilenames = samplesFilenames
    .filter((p) => !p.startsWith("."))
    .map((p) => join(samplesPath, p));

  return samplesCache.cachedFilenames;
};
