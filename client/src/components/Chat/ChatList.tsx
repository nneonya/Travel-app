import React from 'react';
import Avatar from '@/components/Avatar/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import './ChatList.css';

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
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUserId: number;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat, currentUserId }) => {
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
  };

  const getOtherParticipant = (chat: Chat) => {
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

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Сообщения</h2>
      </div>
      <div className="chat-list-content">
        {chats.length === 0 ? (
          <div className="no-chats">
            У вас пока нет активных чатов
          </div>
        ) : (
          chats.map(chat => {
            const otherParticipant = getOtherParticipant(chat);
            
            return (
              <div
                key={chat.chat_id}
                className={`chat-item ${selectedChat?.chat_id === chat.chat_id ? 'selected' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-item-avatar">
                  <Avatar
                    url={otherParticipant.avatar}
                    name={otherParticipant.name}
                    size={50}
                  />
                  {chat.unread_count > 0 && (
                    <span className="unread-badge">{chat.unread_count}</span>
                  )}
                </div>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <span className="chat-item-name">{otherParticipant.name}</span>
                    {chat.last_message_time && (
                      <span className="chat-item-time">
                        {formatTime(chat.last_message_time)}
                      </span>
                    )}
                  </div>
                  <div className="chat-item-trip">
                    {chat.from_city} → {chat.to_city}
                  </div>
                  {chat.last_message && (
                    <div className="chat-item-message">
                      {chat.last_message}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList; 