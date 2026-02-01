import {
  type Message,
  type OmitPartialGroupDMChannel,
  PermissionsBitField,
} from "discord.js";
import { config } from "../config";
import { banHijackedAccount } from "../utils/banHijackedAccount";
import { banReason } from "../constants/banReasons";

interface HoneypotValidationParams {
  message: OmitPartialGroupDMChannel<Message<boolean>>;
}

export const honeypotValidation = async ({
  message,
}: HoneypotValidationParams) => {
  if (message.channel.id !== config.honeypot) return;

  const member = message.member;
  if (!member) return;

  // Bypass by role
  const allowed = member.roles.cache.some((role) =>
    config.allowedRoles.includes(role.id),
  );

  if (allowed) return;

  // extra protection to admin
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const user = member.user.tag;
  const userId = member.id;

  banHijackedAccount({
    reason: banReason.HONEYPOT,
    message,
    userId,
    member,
    user,
  });
};
