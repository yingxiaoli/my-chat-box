export interface Env {
    OPENAI_API_KEY: string;
    CHAT_STORAGE: KVNamespace;
    OPENAI_BASE_URL?: string;
  }
  
  export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }
  
  export interface ChatSession {
    id: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface OpenAIMessage {
    role: 'user' | 'ai' | 'system';
    content: string;
  }
  
  export interface OpenAIResponse {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
  }
  