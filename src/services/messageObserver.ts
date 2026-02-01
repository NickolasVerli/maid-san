import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { checkForScammingImage } from "./checkForScammingImage";
import { honeypotValidation } from "./honeypotValidation";

export const messageObserver = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
) => {
  if (message.author.bot) return;

  honeypotValidation({ message });
  checkForScammingImage({ message });
};
