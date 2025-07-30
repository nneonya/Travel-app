import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import ChatList from '@/components/Chat/ChatList';
import ChatWindow from '@/components/Chat/ChatWindow';
import './ChatPage.css';
import { io, Socket } from 'socket.io-client';

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

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      withCredentials: true,
    });
    setSocket(newSocket);
    newSocket.on('connect_error', () => {
      setError('Ошибка соединения с сервером');
      setShowError(true);
      setLoading(false);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setMessages([]); // Сброс сообщений при смене чата
      fetchMessages(selectedChat.chat_id);
      if (socket) {
        socket.emit('joinChat', selectedChat.chat_id);
      }
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;
    type SocketMessage = {
      id: number;
      chat_id: number;
      content: string;
      sent_at?: string;
      created_at?: string;
      sender_id: number;
      sender_name?: string;
      sender_avatar?: string;
    };
    const handleNewMessage = (msg: SocketMessage) => {
      // Если открыт этот чат — добавляем сообщение, если его ещё нет
      if (selectedChat && msg.chat_id === selectedChat.chat_id) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id,
            content: msg.content,
            created_at: msg.sent_at || msg.created_at || '',
            sender_id: msg.sender_id,
            sender_name: msg.sender_name || 'Пользователь',
            sender_avatar: msg.sender_avatar || '',
          }];
        });
      } else {
        // Если не открыт — обновляем список чатов (для счетчика)
        fetchChats();
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChat]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chats');
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      } else if (selectedChat) {
        const updatedSelectedChat = data.find((chat: Chat) => chat.chat_id === selectedChat.chat_id);
        if (updatedSelectedChat) {
          setSelectedChat(updatedSelectedChat);
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Ошибка при загрузке чатов');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Ошибка при загрузке сообщений');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      // Отправляем через REST для сохранения
      await api.post(`/chats/${selectedChat.chat_id}/messages`, { content });
      // Не отправляем через сокет! Сервер сам рассылает событие newMessage
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка при отправке сообщения');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => setShowError(false);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="chat-page">
      {showError && (
        <div className="error-banner" onClick={handleCloseError} style={{cursor:'pointer'}}>
          {error}
        </div>
      )}
      <div className="chat-container">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          currentUserId={user?.id || 0}
        />
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            onSendMessage={sendMessage}
            currentUserId={user?.id || 0}
          />
        ) : (
          <div className="no-chat-selected">
            Выберите чат для начала общения
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 