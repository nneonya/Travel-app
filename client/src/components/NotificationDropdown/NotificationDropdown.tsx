import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar/Avatar';
import api from '@/api/api';
import './NotificationDropdown.css';

interface TripRequest {
  id: number;
  trip_id: number;
  user_id: number;
  status: string;
  name: string;
  age: number;
  city: string;
  fromCity: string;
  toCity: string;
  date_from: string;
  date_to: string;
  avatar?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchRequests();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchRequests = async () => {
    try {
      if (!user) {
        throw new Error('Необходимо авторизоваться');
      }
      
      const { data } = await api.get('/notifications/requests');
      setRequests(data);
      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке запросов:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке запросов');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (tripId: number, requestId: number) => {
    try {
      if (!user) {
        throw new Error('Необходимо авторизоваться');
      }

      await api.put(`/trip-requests/${requestId}`, { status: 'accepted' });
      setRequests(requests.filter(req => req.id !== requestId));
      setError(null);
    } catch (error) {
      console.error('Ошибка при принятии запроса:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при принятии запроса');
    }
  };

  const handleReject = async (tripId: number, requestId: number) => {
    try {
      if (!user) {
        throw new Error('Необходимо авторизоваться');
      }

      await api.put(`/trip-requests/${requestId}`, { status: 'rejected' });
      setRequests(requests.filter(req => req.id !== requestId));
      setError(null);
    } catch (error) {
      console.error('Ошибка при отклонении запроса:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при отклонении запроса');
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="notification-dropdown" ref={dropdownRef}>
        <div className="notification-header">
          <h3>Уведомления</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="error">Необходимо авторизоваться</div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>Уведомления</h3>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && requests.length === 0 && (
        <div className="no-notifications">Нет новых уведомлений</div>
      )}

      {requests.map(request => (
        <div key={request.id} className="request-item">
          <div className="request-info">
            <div className="user-info">
              <Avatar
                url={request.avatar}
                name={request.name}
                size={40}
              />
              <div className="user-details">
                <div className="user-name-info">
                  <span className="name">{request.name}</span>
                  <span className="age">{request.age} лет</span>
                  {request.city && <span className="city">{request.city}</span>}
                </div>
              </div>
            </div>
            <div className="trip-details">
              <strong>{request.fromCity} → {request.toCity}</strong>
              <div className="trip-dates">
                {new Date(request.date_from).toLocaleDateString()} - {new Date(request.date_to).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="request-actions">
            <button 
              className="accept-button"
              onClick={() => handleAccept(request.trip_id, request.id)}
            >
              Принять
            </button>
            <button 
              className="reject-button"
              onClick={() => handleReject(request.trip_id, request.id)}
            >
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationDropdown; 