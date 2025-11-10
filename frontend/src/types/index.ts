export interface Message{
    id:string;
    content:string;
    role:'user'|'ai';
    timestamp:string;
}

export interface SendMessageResponse {
    sendMessage: Message;
  }