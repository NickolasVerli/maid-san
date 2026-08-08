import { EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { discordClient } from "../../config/discord";
import type { BanEventEmitterPayload, Observer } from "../../types";

export const logBanEventsToReportChannel: Observer<BanEventEmitterPayload> =
  async function (payload) {
    const logChannel = await discordClient.channels.fetch(config.logChannel);

    if (!logChannel || !logChannel.isTextBased() || logChannel.isDMBased()) {
      console.log("[warn] the passed channel id is invalid");
      return;
    }

    const { user, deletedCount, reason } = payload;
    const embed = new EmbedBuilder()
      .setColor(0xff5555)
      .setTitle("Automatic ban")
      .setFields([
        { name: "User", value: `<@${user.id}>`, inline: true },
        { name: "Deleted", value: deletedCount.toString(), inline: true },
        { name: "Date", value: `<t:${~~(Date.now() / 1000)}:F>` },
      ])
      .setFooter({ text: `Motivo: ${reason}` });

    console.log(
      `[info] sending ban message to report channel. ban reason: ${reason}`,
    );

    await logChannel.send({ embeds: [embed] }).catch((err: unknown) => {
      console.log("[error] couldn't send a log of ban due to exception");
      console.trace(err);
    });
  };

logBanEventsToReportChannel.observerName = `logBanEventsToReportChannel`;
