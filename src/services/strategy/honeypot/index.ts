import { config } from "../../../config";
import { banReason } from "../../../constants/banReasons";
import { banHijackedAccount } from "../../punishment/banHijackedAccount";
import { isMemberExempt } from "../../../utils/memberPermissions";
import type { MessageStrategy } from "../types";

export const honeypotStrategy: MessageStrategy = {
  name: "honeypot",
  run: async (message) => {
    if (!config.honeypotChannels.includes(message.channel.id)) return;

    const member = message.member;
    if (!member) return;

    if (isMemberExempt(member)) return;

    await banHijackedAccount({
      reason: banReason.HONEYPOT,
      message,
      member,
    });
  },
};
