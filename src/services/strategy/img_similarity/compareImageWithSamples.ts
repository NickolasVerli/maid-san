import { fileTypeFromBuffer } from "file-type";
import imghash from "imghash";
import leven from "leven";
import sharp from "sharp";
import { MIN_MATCH_WITH_SAMPLE_IMAGE } from "../../../constants/imageParams";
import { getSampleHash } from "./getSampleHash";
import { getSamplesFilenames } from "./getSamplesFilenames";

const NO_MATCH = new Error("no-match");

export const compareImageWithSamples = async (file: Buffer) => {
  if (file.length === 0) return false;

  const fileType = await fileTypeFromBuffer(file);
  if (!fileType?.mime.startsWith("image/")) return false;

  const fileNormalized = await sharp(file).rotate().toFormat("png").toBuffer();
  const fileHash = await imghash.hash(fileNormalized);

  const samplesFilenames = await getSamplesFilenames();

  const promises = samplesFilenames.map(async (p) => {
    try {
      const sampleHash = await getSampleHash(p);

      const comparisonDistance = leven(sampleHash, fileHash);

      if (comparisonDistance <= MIN_MATCH_WITH_SAMPLE_IMAGE) {
        console.log(
          `[info] match with sample file ${JSON.stringify(p)}, match of distance ${comparisonDistance}`,
        );

        return true;
      }
    } catch (err) {
      console.log(`[error] sample "${p}" could not be decoded as image`);
    }

    return Promise.reject(NO_MATCH);
  });

  try {
    await Promise.any(promises);

    return true;
  } catch {
    return false;
  }
};
