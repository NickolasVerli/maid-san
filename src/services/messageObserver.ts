import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { config } from "../config";
import { strategies } from "./strategy";

export const messageObserver = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
) => {
  if (message.author.bot) return;

  if (config.excludedChannels.includes(message.channel.id)) return;

  await Promise.all(
    strategies.map(async (strategy) => {
      try {
        await strategy.run(message);
      } catch (err) {
        console.log(`[error] strategy ${strategy.name} failed with exception`);
        console.trace(err);
      }
    }),
  );
};
