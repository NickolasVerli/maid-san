import { createEventEmitter } from "../services";
import type { EventEmitterPayload } from "../types";

export const eventEmitter = createEventEmitter<EventEmitterPayload>();
