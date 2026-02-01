import { readFile } from "fs/promises";
import imghash from "imghash";

const sampleHashesCache = new Map<string, string>();

export const getSampleHash = async (filePath: string) => {
  if (sampleHashesCache.has(filePath)) return sampleHashesCache.get(filePath)!;

  const file = await readFile(filePath);

  const sampleHash = await imghash.hash(file);

  sampleHashesCache.set(filePath, sampleHash);

  return sampleHash;
};
