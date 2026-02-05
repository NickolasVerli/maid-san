import {
  ChannelType,
  NewsChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
  type GuildMember,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { Duration } from "js-duration";
import { eventEmitter } from "../config";
import { deleteMessage } from "./deleteMessage";

interface BanHijackedAccountProps {
  member: GuildMember;
  message: OmitPartialGroupDMChannel<Message<boolean>>;
  reason: string;
}

export const banHijackedAccount = async ({
  member,
  message,
  reason,
}: BanHijackedAccountProps) => {
  try {
    let deletedCount = 1;

    await deleteMessage({
      message,
      user: member,
      reason,
      channel: message.channel as
        | NewsChannel
        | StageChannel
        | TextChannel
        | VoiceChannel,
    });

    const channels = message.guild?.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText && c.viewable,
    );

    const listOfChannels = channels?.values() ?? [];

    await Promise.all(
      listOfChannels.map(async (channel) => {
        if (!channel.isTextBased() || channel.isDMBased() || channel.isThread())
          return;

        const messages = await channel.messages.fetch({ limit: 100 });

        try {
          if (messages.size === 0) return;

          await Promise.all(
            messages.values().map(async (msg) => {
              const idade = Duration.between(
                new Date(message.createdTimestamp),
                new Date(),
              ).abs();
              const isRecent = idade.lessThan(Duration.of({ hours: 3 }));

              const isHijackedUser = msg.author.id === member.id;

              if (isHijackedUser && isRecent) {
                deletedCount++;
                await deleteMessage({
                  message: msg,
                  user: member,
                  channel,
                  reason,
                });
              }
            }),
          );
        } catch (err) {
          console.log(
            `[error] couldn't process channel messages for channel ${channel.id}`,
          );
          console.trace(err);
        }
      }),
    );

    const payload = { user: member, deletedCount, reason };

    console.log(
      `[event] (bannedUser) member ${member.user.tag}, messages deleted: ${deletedCount}, reason: ${reason}`,
    );

    await eventEmitter.send("bannedUser", payload);
    await member.ban({ reason });
  } catch (err) {
    console.error("[error] security system failed with exception");
    console.trace(err);
  }
};
