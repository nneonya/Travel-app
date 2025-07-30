import React, { useState, useRef } from 'react';
import Avatar from '@/components/Avatar/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import './ChatWindow.css';

interface Chat {
  chat_id: number;
  trip_id: number;
  creator_id: number;
  companion_id: number;
  from_city: string;
  to_city: string;
  date_from: string;
  date_to: string;
  creator_name: string;
  creator_avatar: string;
  companion_name: string;
  companion_avatar: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
}

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages, onSendMessage, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const getOtherParticipant = () => {
    if (chat.creator_id === currentUserId) {
      return {
        id: chat.companion_id,
        name: chat.companion_name,
        avatar: chat.companion_avatar
      };
    } else {
      return {
        id: chat.creator_id,
        name: chat.creator_name,
        avatar: chat.creator_avatar
      };
    }
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-user">
          <Avatar
            url={otherParticipant.avatar}
            name={otherParticipant.name}
            size={40}
          />
          <div className="chat-header-info">
            <h3>{otherParticipant.name}</h3>
            <div className="chat-header-trip">
              {chat.from_city} → {chat.to_city}
            </div>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender_id === currentUserId ? 'own' : 'other'}`}
          >
            <div className="message-avatar">
              <Avatar
                url={message.sender_avatar}
                name={message.sender_name}
                size={32}
              />
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{message.sender_name}</span>
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
              <div className="message-text">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="message-input"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Отправить
        </button>
      </form>
    </div>
  );
};

export default ChatWindow; 