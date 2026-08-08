import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from ".";
import { COMMAND_NAME } from "../constants/commands";

const commands = [
  new SlashCommandBuilder()
    .setName(COMMAND_NAME.addImage)
    .setDescription(
      "Adiciona uma imagem de golpe como sample para detecção automática",
    )
    .addAttachmentOption((builder) =>
      builder
        .setName("imagem")
        .setDescription("Imagem de golpe que será salva como sample")
        .setRequired(true),
    ),
].map((comm) => comm.toJSON());

export const registerCommands = async (appId: string, guildId: string) => {
  const rest = new REST({ version: "10" }).setToken(config.botToken);

  try {
    await rest.put(Routes.applicationGuildCommands(appId, guildId), {
      body: commands,
    });
  } catch (err) {
    console.log("[error] couldn't register commands properly due to error");
    console.log(err);
  }
};
