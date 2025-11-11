import { useState, useCallback, useRef } from "react";
import type { Message, Conversation } from "../types/index.js";
import { sendMessage } from "../graphql/api";
import { useLocalStorage } from "./useLocalStorage";

export function useChat() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(conversations.length > 0 ? conversations[0].id : null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  // 创建新会话
  const createConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  }, [setConversations]);

  // 发送消息
  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let conversationId = currentConversationId;

      // 如果没有当前会话，创建新会话
      if (!conversationId) {
        conversationId = createConversation();
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      // 用于存储当前会话的消息
      let currentMessages: Message[] = [];

      // 添加用户消息
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === conversationId) {
            currentMessages = conv.messages; // 保存当前消息
            return {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: Date.now(),
            };
          }
          return conv;
        });
        return updated;
      });

      // 创建 AI 消息占位符
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "思考中...",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : conv
        )
      );

      setIsLoading(true);
      setError(null);

      // 创建 AbortController 用于取消请求
      abortControllerRef.current = new AbortController();

      try {
        const messagesToSend = [...currentMessages, userMessage];
        const assistantReply = await sendMessage({
          messages: messagesToSend,
          signal: abortControllerRef.current.signal,
        });

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantReply, isStreaming: false }
                      : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);

        // 移除失败的 AI 消息
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter(
                    (msg) => msg.id !== assistantMessageId
                  ),
                }
              : conv
          )
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      currentConversationId,
      createConversation,
      setConversations,
      // updateConversationTitle,
    ]
  );

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  // 切换会话
  // const switchConversation = useCallback((conversationId: string) => {
  //   setCurrentConversationId(conversationId);
  //   setError(null);
  // }, []);
  const clearConversation = useCallback(() => {
    setConversations((pre) => {
      const updated = pre.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [],
            updatedAt: Date.now(),
          };
        }
        return conv;
      });
      return updated;
    });
  }, [setConversations]);
  // 删除会话
  // const deleteConversation = useCallback(
  //   (conversationId: string) => {
  //     setConversations((prev) => {
  //       const remaining = prev.filter((conv) => conv.id !== conversationId);

  //       // 如果删除的是当前会话，切换到第一个剩余会话
  //       if (currentConversationId === conversationId) {
  //         setCurrentConversationId(
  //           remaining.length > 0 ? remaining[0].id : null
  //         );
  //       }

  //       return remaining;
  //     });
  //   },
  //   [currentConversationId, setConversations]
  // );

  // 清空所有会话
  // const clearAllConversations = useCallback(() => {
  //   setConversations([]);
  //   setCurrentConversationId(null);
  // }, [setConversations]);

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    sendUserMessage,
    clearConversation,
    stopGeneration,
    // createConversation,
    // switchConversation,
    // deleteConversation,
    // clearAllConversations,
  };
}
