export interface BotInfo {
  name: string;
  role: string;
}

export interface Message {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  botInfo?: BotInfo;
  messages?: Message[];
  lastUpdated?: string;
}
