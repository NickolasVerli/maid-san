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
import { eventEmitter } from "../../events/eventEmitter";
import { deleteMessage } from "./deleteMessage";

const DELETE_MESSAGES_WINDOW_SECONDS = 60 * 10;
const UNBAN_DELAY_MS = 2_000;
const RECENT_MESSAGE_WINDOW_HOURS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    console.log(
      `[event] (bannedUser) member ${member.user.tag}, messages deleted: ${deletedCount}, reason: ${reason}`,
    );

    await eventEmitter.send("bannedUser", {
      user: member,
      deletedCount,
      reason,
    });

    await member.ban({
      reason,
      deleteMessageSeconds: DELETE_MESSAGES_WINDOW_SECONDS,
    });

    await deleteRecentMessages({ member, message, reason });
  } catch (err) {
    console.error("[error] security system failed with exception");
    console.trace(err);
  } finally {
    await sleep(UNBAN_DELAY_MS);

    await member.guild.members
      .unban(member.id, "Desbanido automaticamente após limpeza das mensagens")
      .catch((err) => {
        console.log("[warn] couldn't unban member after cleaning messages");
        console.log(err);
      });
  }
};

const deleteRecentMessages = async ({
  member,
  message,
  reason,
}: BanHijackedAccountProps) => {
  try {
    const channels = message.guild?.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText && c.viewable,
    );

    const listOfChannels = channels?.values() ?? [];

    await Promise.all(
      listOfChannels.map(async (channel) => {
        if (!channel.isTextBased() || channel.isDMBased() || channel.isThread())
          return;

        try {
          const messages = await channel.messages.fetch({ limit: 100 });

          if (messages.size === 0) return;

          await Promise.all(
            messages.values().map(async (msg) => {
              const idade = Duration.between(
                new Date(message.createdTimestamp),
                new Date(),
              ).abs();
              const isRecent = idade.lessThan(
                Duration.of({ hours: RECENT_MESSAGE_WINDOW_HOURS }),
              );

              const isHijackedUser = msg.author.id === member.id;

              if (isHijackedUser && isRecent) {
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
  } catch (err) {
    console.error("[error] couldn't sweep recent messages of hijacked account");
    console.trace(err);
  }
};
