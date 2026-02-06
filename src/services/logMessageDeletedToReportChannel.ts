import { EmbedBuilder } from "discord.js";
import { Duration } from "js-duration";
import { config } from "../config";
import { discordClient } from "../config/discord";
import { MessageDeletedEventEmitterPayload, Observer } from "../types";
import { loadFileFromUrl } from "../utils/loadFileFromUrl";

export const logMessageDeletedToReportChannel: Observer<
  MessageDeletedEventEmitterPayload
> = async (payload) => {
  const logChannel = await discordClient.channels.fetch(config.logChannel);

  if (!logChannel || !logChannel.isTextBased() || logChannel.isDMBased())
    return console.log("[warn] the passed channel id is invalid");

  const { user, message: msg } = payload;
  const delayToRespond = Duration.between(new Date(), msg.createdAt);

  const embed = new EmbedBuilder()
    .setColor(0xff5555)
    .setTitle("Message deleted automatically")
    .setFields([
      { name: "User", value: `<@${user.id}>`, inline: true },
      { name: "Channel", value: `<#${msg.channel.id}>` },
      { name: "Message", value: JSON.stringify(msg.content), inline: true },
      { name: "Time to delete", value: delayToRespond.toString() },
      { name: "Date", value: `<t:${~~(Date.now() / 1000)}:F>` },
    ])
    .setFooter({ text: `Motivo: ${payload.reason}` });

  const files = await Promise.all(
    msg.attachments
      .values()
      .map(
        async (attch) =>
          (await loadFileFromUrl(attch.url, attch.name)).attachment,
      ),
  );

  console.log("[info] sending deleted message to report channel");

  await logChannel.send({ embeds: [embed], files }).catch((err: unknown) => {
    console.log("[error] couldn't send a log of exclusion due to exception:");
    console.trace(err);
  });
};

logMessageDeletedToReportChannel.observerName = `logMessageDeletedToReportChannel`;
