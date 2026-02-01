import imghash from "imghash";
import leven from "leven";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { MIN_MATCH_WITH_SAMPLE_IMAGE } from "../constants/imageParams";
import { getSampleHash } from "./getSampleHash";

export const compareImageWithSamples = async (file: Buffer<ArrayBuffer>) => {
  const fileHash = await imghash.hash(file);

  const samplesPath = join(__dirname, "..", "..", "assets", "samples");
  const scamsFilenames = await readdir(samplesPath);

  for (const p of scamsFilenames) {
    try {
      const sampleHash = await getSampleHash(join(samplesPath, p));

      if (leven(sampleHash, fileHash) <= MIN_MATCH_WITH_SAMPLE_IMAGE)
        return true;
    } catch (err) {
      if (!p.endsWith(".gitkeep"))
        console.log(
          `[error]: couldn't process the file ${p} in sample dir, please, try converting the image to another format`,
        );
    }
  }

  return false;
};
