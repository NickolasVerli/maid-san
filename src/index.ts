import { config, discordClient, eventEmitter } from "./config";
import {
  logBanEventsToReportChannel,
  logMessageDeletedToReportChannel,
  logToMemberDmBanReason,
  messageObserver,
} from "./services";

discordClient.once("clientReady", (client) => {
  const userTag = client.user.tag;

  console.log(`[init] bot online as: ${userTag} user tag`);
});

discordClient.on("messageCreate", messageObserver);

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
