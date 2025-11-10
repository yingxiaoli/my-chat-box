import { Env, Message, ChatSession } from './types';

export class ChatStorageService {
  private kv: KVNamespace;
  private defaultSessionId = 'default-session';

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getSession(sessionId: string = this.defaultSessionId): Promise<ChatSession> {
    const sessionData = await this.kv.get(sessionId);
    
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // 创建新会话
    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveSession(newSession);
    return newSession;
  }

  async saveSession(session: ChatSession): Promise<void> {
    session.updatedAt = new Date().toISOString();
    await this.kv.put(session.id, JSON.stringify(session));
  }

  async addMessage(content: string, role: 'user' | 'assistant', sessionId: string = this.defaultSessionId): Promise<Message> {
    const session = await this.getSession(sessionId);
    
    const message: Message = {
      id: this.generateId(),
      content,
      role,
      timestamp: new Date().toISOString()
    };

    session.messages.push(message);
    await this.saveSession(session);
    
    return message;
  }

  async getMessages(sessionId: string = this.defaultSessionId, limit: number = 50): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session.messages.slice(-limit);
  }

  async clearMessages(sessionId: string = this.defaultSessionId): Promise<void> {
    const session = await this.getSession(sessionId);
    session.messages = [];
    await this.saveSession(session);
  }

  async getRecentMessages(sessionId: string = this.defaultSessionId, count: number = 10): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session.messages.slice(-count);
  }
}
