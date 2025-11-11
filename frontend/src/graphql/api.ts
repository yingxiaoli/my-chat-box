import type { Message } from "../types/index.js";

// GraphQL endpoint（默认指向 Cloudflare Worker）
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://your-worker.workers.dev";
const GRAPHQL_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/graphql`;

const SEND_MESSAGE_MUTATION = `
  mutation SendMessage($messages: [MessageInput!]!) {
    sendMessage(messages: $messages) {
      content
    }
  }
`;

const HEALTH_QUERY = `
  query HealthCheck {
    health {
      status
      timestamp
    }
  }
`;

export interface SendMessageOptions {
  messages: Message[];
  signal?: AbortSignal;
}

/**
 * 通过 GraphQL mutation 发送消息
 */
export async function sendMessage({
  messages,
  signal,
}: SendMessageOptions): Promise<string> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: SEND_MESSAGE_MUTATION,
        variables: {
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      }),
      signal,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (result.errors?.length) {
      throw new Error(result.errors[0]?.message || "GraphQL error");
    }

    const content = result.data?.sendMessage?.content;
    if (typeof content !== "string") {
      throw new Error("Invalid response from server");
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request was cancelled");
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

/**
 * 测试 GraphQL 健康查询
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: HEALTH_QUERY,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.data?.health?.status === "ok";
  } catch {
    return false;
  }
}
