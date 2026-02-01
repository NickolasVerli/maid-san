import {
  ChannelType,
  DMChannel,
  type GuildMember,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { Duration } from "js-duration";
import { eventEmitter } from "../config";

interface BanHijackedAccountProps {
  member: GuildMember;
  message: OmitPartialGroupDMChannel<Message<boolean>>;
  user: string;
  userId: string;
  reason: string;
}

const _14_days_duration = Duration.of({ days: 14 });

export const banHijackedAccount = async ({
  member,
  message,
  reason,
  user,
  userId,
}: BanHijackedAccountProps) => {
  try {
    let deletedCount = 0;

    const channels = message.guild?.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText && c.viewable,
    );

    for (const channel of channels?.values() ?? []) {
      if (!channel.isTextBased() || channel.isDMBased() || channel.isThread())
        continue;

      channel.messages
        .fetch({ limit: 100 })
        .then(async (messages) => {
          if (messages.size === 0) return;

          for (const msg of messages.values()) {
            const idade = Date.now() - msg.createdTimestamp;

            const isTheSameHijackedUser = msg.author.id === member.id;
            const isFromlast14Days = idade < _14_days_duration.inMilliseconds;

            if (isTheSameHijackedUser && isFromlast14Days) {
              await msg.delete().catch((err) => {
                console.log(
                  "[error] couldn't delete message due to unexpected exception",
                  err,
                );
              });

              const channelId = channel.id;
              const message = msg.content;
              const attachments = msg.attachments;
              eventEmitter.send("messageDeleted", {
                user,
                userId,
                channelId,
                message,
                attachments,
                reason,
                sendAt: msg.createdAt,
              });
              deletedCount++;
            }
          }
        })
        .catch((err) => {
          console.log(
            `[error] couldn't process channel messages for channel ${channel.id}`,
          );
          console.trace(err);
        });
    }

    const payload = { user, userId, deletedCount, reason };

    await eventEmitter.send("bannedUser", payload);
    console.log(
      `[event] (bannedUser) member ${member.user.tag}, messages deleted: ${deletedCount}, reason: ${reason}`,
    );

    await member.ban({ reason });
  } catch (err) {
    console.error("[error] security system failed with exception");
    console.trace(err);
  }
};
