import imghash from "imghash";
import leven from "leven";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { MIN_MATCH_WITH_SAMPLE_IMAGE } from "../constants/imageParams";
import { getSampleHash } from "./getSampleHash";
import { fileTypeFromBuffer } from "file-type";

export const compareImageWithSamples = async (file: Buffer<ArrayBuffer>) => {
  if (file.length === 0) return false;

  const fileType = (await fileTypeFromBuffer(file))!;
  if (!fileType.mime.startsWith("image/")) return false;

  const fileNormalized = await sharp(file).rotate().toFormat("png").toBuffer();
  const fileHash = await imghash.hash(fileNormalized);

  const samplesPath = join(__dirname, "..", "..", "assets", "samples");
  const samplesFilenames = await readdir(samplesPath);

  for (const p of samplesFilenames) {
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
