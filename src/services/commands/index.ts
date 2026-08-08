import type { Interaction } from "discord.js";
import { COMMAND_NAME } from "../../constants/commands";
import { addImageSample } from "./addImageSample";

export const handleInteraction = async (interaction: Interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case COMMAND_NAME.addImage:
        await addImageSample(interaction);
        break;
    }
  } catch (err) {
    console.error("[error] interaction handler failed with exception");
    console.trace(err);

    if (interaction.isRepliable()) {
      await interaction
        .reply({
          content: "Algo deu errado ao processar o comando.",
          ephemeral: true,
        })
        .catch(() => undefined);
    }
  }
};
