import { Env, Message, OpenAIMessage, OpenAIResponse } from './types';

export class OpenAIService {
	private apiKey: string;
	// private baseURL = 'https://api.openai-proxy.com/v1';//本地开发访问localhost:8787/graphql时使用
	private baseURL = 'https://api.openai.com/v1'; //部署到生产环境时使用

	constructor(apiKey: string, baseURL?: string) {
		this.apiKey = apiKey;
		this.baseURL = baseURL || this.baseURL;
	}

	async generateResponse(messages: Message[]): Promise<string> {
		const openAIMessages: OpenAIMessage[] = [
			{
				role: 'system',
				content: '你是一个友善、有帮助的AI助手。请用中文回答用户的问题，保持回答简洁明了且有用。',
			},
			...messages.map((msg) => ({
				role: msg.role as 'user' | 'ai',
				content: msg.content,
			})),
		];

		try {
			// 验证 API Key
			if (!this.apiKey) {
				throw new Error('OpenAI API key not configured');
			}

			if (!this.apiKey.startsWith('sk-')) {
				throw new Error('Invalid OpenAI API key format');
			}
			console.log('baseURL', this.baseURL);
			console.log('openai', messages);
			const response = await fetch(`${this.baseURL}/chat/completions`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: openAIMessages,
					max_tokens: 1000,
					temperature: 0.7,
					stream: false,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('OpenAI API error:', response.status, errorData);
				// 根据不同状态码提供具体错误信息
				switch (response.status) {
					case 401:
						throw new Error('Invalid OpenAI API key');
					case 429:
						throw new Error('OpenAI API rate limit exceeded');
					case 500:
						throw new Error('OpenAI API server error');
					case 503:
						throw new Error('OpenAI API service unavailable');
					default:
						throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
				}
				// throw new Error(`OpenAI API error: ${response.status}`);
			}
			// 解析响应
			const data: OpenAIResponse = await response.json();
			// 验证响应格式
			if (!data.choices || data.choices.length === 0) {
				throw new Error('No response from OpenAI');
			}

			return data.choices[0].message.content;
		} catch (error: any) {
			console.error('Error calling OpenAI API:', error);
			console.error('OpenAI Service Error Details:', {
				message: error.message,
				stack: error.stack,
				apiKeyExists: !!this.apiKey,
				apiKeyFormat: this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'none',
			});
			// 重新抛出带有更多上下文信息的错误
			if (error.message.includes('fetch')) {
				throw new Error(`Network error calling OpenAI API: ${error.message}`);
			} else if (error.message.includes('JSON')) {
				throw new Error(`Invalid JSON response from OpenAI: ${error.message}`);
			} else {
				throw new Error(`Failed to generate AI response: ${error.message}`);
			}
			// throw new Error('Failed to generate AI response');
		}
	}
}
