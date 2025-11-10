import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Message, SendMessageResponse } from "../types";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SEND_MESSAGE } from "../graphql/query";
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendMessage, { loading: sendingMessage }] =
    useMutation<SendMessageResponse>(SEND_MESSAGE, {
      onCompleted: (data) => {
        if (data.sendMessage) {
          setMessages((pre) => [...pre, data.sendMessage]);
          // refetchHistory()
        }
      },
      onError: (err) => {
        console.error("消息发送失败", err);
      },
    });
  const handleSendMessage = async (text: string) => {
    console.log("handleSendMessage", text);
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      role: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((pre) => [...pre, userMessage]);
    try {
      await sendMessage({
        variables: { message: text },
      });
    } catch (err) {
      // 如果发送失败，移除临时消息
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      console.error("发送消息失败:", err);
    }
  };
  return (
    <div className="chart-container">
      <Header />
      <MessageList />
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sendingMessage}
      />
    </div>
  );
};
export default Chat;
