export type ParsedReply = {
  modelAnswer: string;
  reply: string;
};

export function parseAssistantReply(raw: string): ParsedReply {
  const match = raw.match(/MODEL_ANSWER:\s*([\s\S]*?)\n+REPLY:\s*([\s\S]*)/);
  if (!match) {
    return { modelAnswer: "", reply: raw.trim() };
  }
  return { modelAnswer: match[1].trim(), reply: match[2].trim() };
}
