import imghash from "imghash";
import leven from "leven";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  MIN_MATCH_WITH_SAMPLE_IMAGE,
  MIN_MATCHES_TO_BAN,
} from "../constants/imageParams";
import { getSampleHash } from "./getSampleHash";

export const compareImageWithSamples = async (file: Buffer<ArrayBuffer>) => {
  if (file.length === 0) return false;

  const fileNormalized = await sharp(file).rotate().toFormat("png").toBuffer();
  const fileHash = await imghash.hash(fileNormalized);

  const samplesPath = join(__dirname, "..", "..", "assets", "samples");
  const samplesFilenames = await readdir(samplesPath);

  let countMatches = 0;
  for (const p of samplesFilenames) {
    try {
      const sampleHash = await getSampleHash(join(samplesPath, p));

      if (leven(sampleHash, fileHash) <= MIN_MATCH_WITH_SAMPLE_IMAGE) {
        countMatches++;
        if (countMatches >= MIN_MATCHES_TO_BAN) return true;
      }
    } catch (err) {
      if (!p.endsWith(".gitkeep"))
        console.log(
          `[error]: couldn't process the file ${p} in sample dir, please, try converting the image to another format`,
        );
    }
  }

  return false;
};
