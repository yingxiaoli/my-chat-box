import { Env } from './types.ts';
import { ChatStorageService } from './storage';
import { OpenAIService } from './openai';

export interface Context {
	env: Env;
	storage?: ChatStorageService;
	openai: OpenAIService;
}

export const resolvers = {
	Query: {
		chatHistory: async (_: any, { limit = 50, sessionId }: { limit?: number; sessionId?: string }, { storage }: Context) => {
			try {
				return await storage.getMessages(sessionId, limit);
			} catch (error) {
				console.error('Error fetching chat history:', error);
				throw new Error('Failed to fetch chat history');
			}
		},

		message: async (_: any, { id }: { id: string }, { storage }: Context) => {
			try {
				const messages = await storage.getMessages();
				return messages.find((msg) => msg.id === id) || null;
			} catch (error) {
				console.error('Error fetching message:', error);
				throw new Error('Failed to fetch message');
			}
		},
	},

	Mutation: {
		sendMessage: async (_: any, { message, sessionId }: { message: string; sessionId?: string }, { storage, openai, env }: Context) => {
			try {
				if (!env.CHAT_STORAGE) {
					throw new Error('Chat storage not configured');
				}

				if (!env.OPENAI_API_KEY) {
					throw new Error('OpenAI API key not configured');
				}
				// 保存用户消息
				await storage.addMessage(message, 'user', sessionId);

				// 获取最近的消息历史用于生成回复
				const recentMessages = await storage.getRecentMessages(sessionId, 10);

				// 生成 AI 回复
				const aiResponse = await openai.generateResponse(recentMessages);

				// 保存 AI 回复
				const assistantMessage = await storage.addMessage(aiResponse, 'assistant', sessionId);

				return assistantMessage;
			} catch (error) {
				console.error('Error sending message:', error);

				// 如果 AI 生成失败，返回一个错误消息
				const errorMessage = await storage.addMessage('抱歉，我现在无法回复您的消息。请稍后再试。', 'assistant', sessionId);

				return errorMessage;
			}
		},

		clearChat: async (_: any, { sessionId }: { sessionId?: string }, { storage }: Context) => {
			try {
				await storage.clearMessages(sessionId);
				return true;
			} catch (error) {
				console.error('Error clearing chat:', error);
				return false;
			}
		},
	},
};
