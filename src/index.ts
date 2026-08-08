import { config, discordClient } from "./config";
import { registerCommands } from "./config/registerCommands";
import { eventEmitter } from "./events/eventEmitter";
import {
  logBanEventsToReportChannel,
  logMessageDeletedToReportChannel,
  logToMemberDmBanReason,
  messageObserver,
} from "./services";
import { handleInteraction } from "./services/commands";

discordClient.once("clientReady", async (client) => {
  const userTag = client.user.tag;

  console.log(`[init] bot online as: ${userTag} user tag`);

  if (config.guildId) {
    await registerCommands(client.user.id, config.guildId);
  }
});

discordClient.on("messageCreate", messageObserver);
discordClient.on("interactionCreate", handleInteraction);

eventEmitter.subscribe("bannedUser", logToMemberDmBanReason);

if (config.logChannel) {
  eventEmitter.subscribe("bannedUser", logBanEventsToReportChannel);
  eventEmitter.subscribe("messageDeleted", logMessageDeletedToReportChannel);
} else {
  console.log(
    "[info] skipping report channel observers subscription as no log channel was set",
  );
}

discordClient.login(config.botToken);
