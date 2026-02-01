import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRandomEmote } from "../utils/randomEmote";

export const getConfig = () => {
  const {
    ALLOWED_FOR_IDS,
    BOT_TOKEN,
    HONEYPOT_ID,
    LOG_CHANNEL_ID,
    MODERATORS_IDS,
  } = process.env;

  const allowedRoles = ALLOWED_FOR_IDS?.split(", ") ?? [];
  const moderators = MODERATORS_IDS?.split(", ") ?? [];

  const samplesDirpath = join(__dirname, "..", "..", "assets", "samples");
  const hasSamplesDir = existsSync(samplesDirpath);

  if (!hasSamplesDir)
    console.log(
      `\n\n[warn] maid-san couldn't find a samples dir created with samples to ban scam images, please provide one and populate it\n\n`,
    );
  else {
    const samplesDir = readdirSync(samplesDirpath);

    if (!samplesDir.length)
      console.log(
        `\n\n[warn] samples dir seems to be empty, please populate it with scams samples, it'll be used to auto exclude scams as soon as maid-san identify then ${getRandomEmote()}\n\n`,
      );
  }
  if (!BOT_TOKEN) {
    console.log(
      `\n\n[error] maid-chan can't work without an bot token, could you provide one for her puh lease? ${getRandomEmote()}\n\n`,
    );
    throw new Error("missing BOT_TOKEN env");
  }
  if (!HONEYPOT_ID)
    console.warn(
      `\n\n[warn] the env variable HONEYPOT_ID seems to be empty, maid-san won't be able to clean most usual mass span attacks if one is not provided ${getRandomEmote()}\n\n`,
    );
  if (!LOG_CHANNEL_ID) {
    console.log(
      `\n\n[info] the env variable LOG_CHANNEL_ID seems to be empty, well, maid-san doesn't need it ${getRandomEmote()}`,
    );
    console.log(
      `[dev] although maid-san doesn't NEED one, i recommend adding one channel to maintain track of what was banned and for what reason,\nthat way you can provide support to any possible false positives\n\n`,
    );
  }
  if (!allowedRoles.length)
    console.warn(
      `\n\n[warn]: the env variable ALLOWED_FOR_IDS seems to be empty, maid-san recommend checking if this is intentional ${getRandomEmote()}\n\n`,
    );

  return {
    botToken: BOT_TOKEN!,
    honeypot: HONEYPOT_ID!,
    logChannel: LOG_CHANNEL_ID!,
    moderators,
    hasSamplesDir,
    allowedRoles,
  };
};
