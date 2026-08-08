import { honeypotStrategy } from "./honeypot";
import { imgSimilarityStrategy } from "./img_similarity";
import { regexStrategy } from "./regex";
import type { MessageStrategy } from "./types";

export const strategies: MessageStrategy[] = [
  honeypotStrategy,
  imgSimilarityStrategy,
  regexStrategy,
];
