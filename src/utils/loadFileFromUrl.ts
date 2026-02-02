import { AttachmentBuilder } from "discord.js";

export const loadFileFromUrl = async (
  url: string,
  filename = "image.png",
  signal: AbortSignal | null = null,
) => {
  const res = await fetch(url, { signal });
  if (!res.ok)
    throw new Error(
      `[error] fetch failed with status ${res.status} ${res.statusText}`,
    );

  const arrayBuffer = await res.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("[error] empty file received");
  }

  const buffer = Buffer.from(arrayBuffer);

  return {
    fileBuffer: buffer,
    attachment: new AttachmentBuilder(buffer, { name: filename }),
  };
};
