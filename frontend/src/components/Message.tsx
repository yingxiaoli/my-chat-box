const classMap = {
  assistant: "ai-msg",
  user: "user-msg",
};
const Message = ({ message }) => {
  return (
    <div className={`msg-container ${classMap[message.role]}`}>
      <span className="msg-txt">{message.content}</span>
    </div>
  );
};

export default Message;
