import { fileTypeFromBuffer } from "file-type";
import imghash from "imghash";
import leven from "leven";
import sharp from "sharp";
import { MIN_MATCH_WITH_SAMPLE_IMAGE } from "../constants/imageParams";
import { getSampleHash } from "./getSampleHash";
import { getSamplesFilenames } from "./getSamplesFilenames";

export const compareImageWithSamples = async (file: Buffer) => {
  if (file.length === 0) return false;

  const fileType = await fileTypeFromBuffer(file);
  if (!fileType?.mime.startsWith("image/")) return false;

  const fileNormalized = await sharp(file).rotate().toFormat("png").toBuffer();
  const fileHash = await imghash.hash(fileNormalized);

  const samplesFilenames = await getSamplesFilenames();

  for (const p of samplesFilenames) {
    try {
      const sampleHash = await getSampleHash(p);

      if (leven(sampleHash, fileHash) <= MIN_MATCH_WITH_SAMPLE_IMAGE)
        return true;
    } catch (err) {
      console.log(`[error] sample "${p}" could not be decoded as image`);
    }
  }

  return false;
};
