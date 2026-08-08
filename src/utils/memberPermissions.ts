import { PermissionsBitField, type GuildMember } from "discord.js";
import { config } from "../config";

export const hasAllowedRole = (member: GuildMember) =>
  member.roles.cache.some((role) => config.allowedRoles.includes(role.id));

export const isAdmin = (member: GuildMember) =>
  member.permissions.has(PermissionsBitField.Flags.Administrator);

export const isMemberExempt = (member: GuildMember) =>
  hasAllowedRole(member) || isAdmin(member);

export const isAuthorizedToManageSamples = (member: GuildMember) =>
  hasAllowedRole(member) ||
  config.moderators.includes(member.id) ||
  isAdmin(member);
