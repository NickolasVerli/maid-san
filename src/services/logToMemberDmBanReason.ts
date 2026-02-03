import { DiscordAPIError } from "discord.js";
import { config, discordClient } from "../config";
import { BanEventEmitterPayload, Observer } from "../types";

export const logToMemberDmBanReason: Observer<BanEventEmitterPayload> = async (
  payload,
) => {
  const member = await discordClient.users.fetch(payload.user.id);

  const userDM = await member.createDM();

  const message = [
    `Olá, ${member.username} 👋`,
    ``,
    `Identificamos atividade suspeita em sua conta no servidor que indica possível comprometimento (hacking).`,
    ``,
    `Por segurança, sua conta foi banida do servidor.`,
    ``,
    `Causa identificada: ${payload.reason}`,
    ``,
    `🔐 O que fazer agora:`,
    `1. Altere sua senha do Discord`,
    `2. Ative autenticação em duas etapas (2FA)`,
    `3. Revise sessões e apps conectados`,
    ``,
    `📨 Como contestar o ban:`,
    `Entre em contato com um dos moderadores após proteger sua conta:`,
    ``,
    `${config.moderators.map((m) => `• <@${m}> ou https://discord.com/users/${m}`).join("\n")}`,
    ``,
    `— Equipe de Moderação`,
  ].join("\n");

  try {
    await userDM.send({ content: message });
  } catch (err) {
    if (err instanceof DiscordAPIError && err.code === 50007) {
      return console.warn(
        `[warn] user ${payload.user} has dms locked, couldn't sent him a message`,
      );
    }

    console.log("[error] couldn't sent dm to member due to unexpected error");
    console.trace(err);
  }
};

logToMemberDmBanReason.observerName = `logToMemberDmBanReason`;
