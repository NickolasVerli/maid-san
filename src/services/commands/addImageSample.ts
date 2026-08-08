import { GuildMember, type Attachment, type ChatInputCommandInteraction } from "discord.js";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../../config";
import { loadFileFromUrl } from "../../utils/loadFileFromUrl";
import { isAuthorizedToManageSamples } from "../../utils/memberPermissions";

const getExtension = (attachment: Attachment) => {
  const fromContentType = attachment.contentType?.split("/")[1];

  if (fromContentType) return fromContentType;

  return attachment.name.split(".").pop() ?? "png";
};

export const addImageSample = async (
  interaction: ChatInputCommandInteraction,
) => {
  await interaction.deferReply({ ephemeral: true });

  const member =
    interaction.member instanceof GuildMember
      ? interaction.member
      : await interaction.guild?.members.fetch(interaction.user.id);

  if (!member) {
    return interaction.editReply(
      "Não foi possível identificar você no servidor.",
    );
  }

  if (!isAuthorizedToManageSamples(member)) {
    return interaction.editReply(
      "Você não tem permissão para adicionar samples.",
    );
  }

  const attachment = interaction.options.getAttachment("imagem");

  if (!attachment) {
    return interaction.editReply("Nenhuma imagem foi enviada.");
  }

  if (!attachment.contentType?.startsWith("image/")) {
    return interaction.editReply("O arquivo enviado não é uma imagem.");
  }

  try {
    const { fileBuffer } = await loadFileFromUrl(
      attachment.url,
      attachment.name,
    );

    const filename = `sample_${Date.now()}.${getExtension(attachment)}`;

    await mkdir(config.samplesDir, { recursive: true });
    await writeFile(join(config.samplesDir, filename), fileBuffer);

    console.log(
      `[event] (sampleAdded) member ${member.user.tag} added sample ${filename}`,
    );

    return interaction.editReply(
      `Imagem salva com sucesso como \`${filename}\`.`,
    );
  } catch (err) {
    console.error("[error] couldn't save image as sample due to exception");
    console.trace(err);

    return interaction.editReply(
      "Não foi possível salvar a imagem. Tente novamente mais tarde.",
    );
  }
};
