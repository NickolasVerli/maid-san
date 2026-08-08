import type { Message, OmitPartialGroupDMChannel } from "discord.js";

export interface MessageStrategy {
  name: string;
  run: (message: OmitPartialGroupDMChannel<Message<boolean>>) => Promise<void>;
}
