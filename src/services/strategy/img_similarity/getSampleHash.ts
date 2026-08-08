import { readFile } from "fs/promises";
import imghash from "imghash";
import sharp from "sharp";

const sampleHashesCache = new Map<string, string>();

export const getSampleHash = async (filePath: string) => {
  if (sampleHashesCache.has(filePath)) return sampleHashesCache.get(filePath)!;

  const file = await readFile(filePath);
  const fileNormalized = await sharp(file).rotate().toFormat("png").toBuffer();
  const sampleHash = await imghash.hash(fileNormalized);

  sampleHashesCache.set(filePath, sampleHash);

  return sampleHash;
};
