import { config } from "../../../config";
import { banReason } from "../../../constants/banReasons";
import { MIN_MATCHES_TO_BAN } from "../../../constants/imageParams";
import { loadFileFromUrl } from "../../../utils/loadFileFromUrl";
import { banHijackedAccount } from "../../punishment/banHijackedAccount";
import { compareImageWithSamples } from "./compareImageWithSamples";
import { isMemberExempt } from "../../../utils/memberPermissions";
import type { MessageStrategy } from "../types";

export const imgSimilarityStrategy: MessageStrategy = {
  name: "img_similarity",
  run: async (message) => {
    if (!config.hasSamplesDir) return;

    if (message.attachments.size === 0) return;

    const member = message.member;
    if (!member) return;

    if (isMemberExempt(member)) return;

    const hasMatch = await scanAttachmentsForScam(message);

    if (hasMatch) {
      await banHijackedAccount({
        reason: banReason.IMAGE_MATCH,
        message,
        member,
      });
    }
  },
};

const scanAttachmentsForScam = async (
  message: Parameters<MessageStrategy["run"]>[0],
) => {
  const attachments = message.attachments.values();
  const controller = new AbortController();

  let countMatches = 0;

  const results = await Promise.all(
    attachments.toArray().map(async (attach, _i, arr) => {
      if (controller.signal.aborted) return false;

      const file = await loadFileFromUrl(
        attach.url,
        attach.name,
        controller.signal,
      ).catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return null;

        console.log(
          `[error] couldn't load file ${JSON.stringify(attach.name)} (${attach.url})`,
        );

        return null;
      });

      if (!file) return false;

      const matched = await compareImageWithSamples(file.fileBuffer).catch(
        (err) => {
          console.log(
            `[error] couldn't process file ${JSON.stringify(attach.name)} (${attach.url})`,
          );
          console.trace(err);
          return false;
        },
      );

      if (!matched) return false;

      countMatches++;

      if (countMatches >= Math.min(arr.length, MIN_MATCHES_TO_BAN)) {
        controller.abort();
        return true;
      }

      return false;
    }),
  );

  return results.some(Boolean);
};
