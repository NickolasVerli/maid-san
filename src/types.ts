import {
  GuildMember,
  Message,
  NewsChannel,
  OmitPartialGroupDMChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";

export interface BanEventEmitterPayload {
  user: GuildMember;
  reason: string;
  deletedCount: number;
}

export interface MessageDeletedEventEmitterPayload {
  user: GuildMember;
  message: Message<true> | OmitPartialGroupDMChannel<Message<boolean>>;
  reason: string;
  channel: NewsChannel | StageChannel | TextChannel | VoiceChannel;
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
