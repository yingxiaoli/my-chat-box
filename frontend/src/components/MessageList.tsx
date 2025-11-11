import Message from "./Message";
const MessageList = ({ messages = [] }) => {
  return (
    <>
      {!messages.length ? (
        <div className="start-conversation">
          <span>开始对话吧~</span>
        </div>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      )}
    </>
  );
};

export default MessageList;
