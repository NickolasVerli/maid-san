import { Attachment, Collection, GuildMember } from "discord.js";

export interface BanEventEmitterPayload {
  user: GuildMember;
  reason: string;
  deletedCount: number;
}

export interface MessageDeletedEventEmitterPayload {
  user: GuildMember;
  channelId: string;
  message: string;
  attachments: Collection<string, Attachment>;
  reason: string;
  sendAt: Date;
}

export type EventEmitterPayload =
  | BanEventEmitterPayload
  | MessageDeletedEventEmitterPayload;

export type MaidSanEvent = "bannedUser" | "messageDeleted";

export type Observer<T> = ((payload: T) => void | Promise<void>) & {
  observerName?: string;
};

export type MappedEvents<T extends MaidSanEvent> = {
  bannedUser: BanEventEmitterPayload;
  messageDeleted: MessageDeletedEventEmitterPayload;
}[T];
