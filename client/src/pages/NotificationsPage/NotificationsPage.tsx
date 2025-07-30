import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import axios from 'axios';
import './NotificationsPage.css';

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
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      if (!user) {
        throw new Error('Необходимо авторизоваться');
      }

      const { data } = await api.get('/notifications/requests');
      console.log('Notifications received:', data);
      setRequests(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
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
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
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
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      setError(error instanceof Error ? error.message : 'Ошибка при отклонении запроса');
    }
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="error">Необходимо авторизоваться</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1>Уведомления</h1>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && requests.length === 0 && (
        <div className="no-notifications">Нет новых уведомлений</div>
      )}

      <div className="requests-list">
        {requests.map(request => (
          <div key={request.id} className="request-item">
            <div className="request-info">
              <div className="trip-details">
                <strong>{request.fromCity} → {request.toCity}</strong>
                <div className="trip-dates">
                  {new Date(request.date_from).toLocaleDateString()} - {new Date(request.date_to).toLocaleDateString()}
                </div>
              </div>
              <div className="user-details">
                <span>{request.name}, {request.age} лет</span>
                {request.city && <span>из г. {request.city}</span>}
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
    </div>
  );
};

export default NotificationsPage; 