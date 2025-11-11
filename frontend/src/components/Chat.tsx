import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import React from "react";
import { useChat } from "../hooks/useChat";
const Chat: React.FC = () => {
  const { currentConversation, isLoading, sendUserMessage, clearConversation } =
    useChat();

  return (
    <div className="chart-container">
      <Header onClearConversation={clearConversation} />
      <MessageList messages={currentConversation?.messages || []} />
      <MessageInput onSendMessage={sendUserMessage} disabled={isLoading} />
    </div>
  );
};
export default Chat;
