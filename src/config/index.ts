import { getConfig } from "./config";

const config = getConfig();

export * from "./discord";
export * from "./eventEmitter";
export { config };
