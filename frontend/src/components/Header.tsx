interface HeaderProps {
  onClearConversation: () => void;
}
function Header({ onClearConversation }: HeaderProps) {
  return (
    <div className="chart-header">
      <span className="chat-title">AI Chat</span>
      <span className="clear-btn" onClick={onClearConversation}>
        清空会话
      </span>
    </div>
  );
}

export default Header;
