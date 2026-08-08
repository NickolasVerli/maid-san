export const banReason = {
  HONEYPOT: "Compromised account / message in honeypot channel",
  IMAGE_MATCH: "Compromised account / scam image sent via any channel",
  REGEX_MATCH: "Compromised account / message matching a scam regex pattern",
} as const;
