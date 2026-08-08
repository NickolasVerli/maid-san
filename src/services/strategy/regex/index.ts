import { banReason } from "../../../constants/banReasons";
import { banHijackedAccount } from "../../punishment/banHijackedAccount";
import { isMemberExempt } from "../../../utils/memberPermissions";
import { loadPatterns } from "./patterns";
import type { MessageStrategy } from "../types";

export const regexStrategy: MessageStrategy = {
  name: "regex",
  run: async (message) => {
    const member = message.member;
    if (!member) return;

    if (isMemberExempt(member)) return;

    const patterns = await loadPatterns();
    if (patterns.length === 0) return;

    const hasMatch = patterns.some((pattern) => pattern.test(message.content));

    if (hasMatch) {
      await banHijackedAccount({
        reason: banReason.REGEX_MATCH,
        message,
        member,
      });
    }
  },
};
