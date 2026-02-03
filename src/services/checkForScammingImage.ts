import {
  PermissionsBitField,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { config } from "../config";
import { banReason } from "../constants/banReasons";
import { banHijackedAccount } from "../utils/banHijackedAccount";
import { compareImageWithSamples } from "../utils/compareImageWithSamples";
import { loadFileFromUrl } from "../utils/loadFileFromUrl";

interface CheckForScammingImageProps {
  message: OmitPartialGroupDMChannel<Message<boolean>>;
}

const EXPECTED_EROR = Symbol("expected");

export const checkForScammingImage = async ({
  message,
}: CheckForScammingImageProps) => {
  if (!config.hasSamplesDir) return;

  if (message.attachments.size === 0) return;

  const member = message.member;
  if (!member) return;

  // Bypass por cargo
  const allowed = member.roles.cache.some((role) =>
    config.allowedRoles.includes(role.id),
  );

  if (allowed) return;

  // Proteção extra
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const attachs = message.attachments.values();

  const comparisonResults = await new Promise<boolean>(async (res) => {
    const requests = new AbortController();

    const result = await Promise.all(
      attachs.map(async (attach) => {
        const file = await loadFileFromUrl(
          attach.url,
          attach.name,
          requests.signal,
        ).catch((err) => {
          if (err instanceof Error && err.name === "AbortError")
            return EXPECTED_EROR;
          return null;
        });

        if (file === EXPECTED_EROR) return;

        const fileBuffer = file?.fileBuffer;

        if (!fileBuffer) return console.log("[error] error processing file");

        const result = await compareImageWithSamples(fileBuffer).catch(
          (err) => {
            console.log(
              `[error] couldn't process file ${JSON.stringify(attach.name)} (${attach.url})`,
            );
            console.trace(err);
          },
        );

        if (result) {
          res(true);
          requests.abort();

          return true;
        }

        return false;
      }),
    );

    if (result.every((r) => !Boolean(r))) res(false);
  });

  if (comparisonResults) {
    const user = member.user.tag;
    const userId = member.id;

    banHijackedAccount({
      reason: banReason.IMAGE_MATCH,
      message,
      member,
      userId,
      user,
    });
  }
};
