import {
  GuildMember,
  Message,
  NewsChannel,
  OmitPartialGroupDMChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { eventEmitter } from "../../events/eventEmitter";

interface DeleteMessageProps {
  message: Message<true> | OmitPartialGroupDMChannel<Message<boolean>>;
  reason: string;
  user: GuildMember;
  channel: NewsChannel | StageChannel | TextChannel | VoiceChannel;
}

export const deleteMessage = async ({
  message,
  channel,
  reason,
  user,
}: DeleteMessageProps) => {
  try {
    await message.delete();

    eventEmitter.send("messageDeleted", {
      message,
      channel,
      reason,
      user,
    });
  } catch (err) {
    console.log("[error] couldn't delete message due to unexpected exception");

    if (err instanceof Error && err.name !== "AggregateError") console.log(err);
  }
};
