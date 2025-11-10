import Message from "./Message";
const MessageList = ({ messages = [] }) => {
  return (
    <div>
      {messages.length ? (
        <>发送消息开始与 AI 助手对话</>
      ) : (
        <>
          {messages.map((message) => (
            <Message message={message} />
          ))}
        </>
      )}
    </div>
  );
};

export default MessageList;
