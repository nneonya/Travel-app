import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/Avatar/Avatar';
import EditTripModal from '@/components/EditTripModal/EditTripModal';
import './TripCard.css';

interface Trip {
  id: number;
  fromCity?: string;
  toCity?: string;
  date_from: string;
  date_to: string;
  description: string;
  companion_description: string;
  preferred_gender: string;
  preferred_age_min: number;
  preferred_age_max: number;
  interests: string[];
  status: string;
  creator_name: string;
  creator_age: number;
  creator_city: string;
  creator_id: number;
  creator_avatar?: string;
  request_status?: string;
  companion_id?: number;
  companion_name?: string;
  companion_avatar?: string;
  created_at: string;
  currentUserHasReviewed?: boolean;
}

interface TripCardProps {
  trip: Trip;
  onDelete?: (tripId: number) => void;
  onUpdate?: (tripId: number, updatedData: Partial<Trip>) => void;
  isSearchPage?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const formatCreatedAt = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else {
    return formatDate(dateString);
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'searching':
      return 'Поиск';
    case 'planned':
      return 'Запланировано';
    case 'completed':
      return 'Завершено';
    default:
      return status;
  }
};

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, onUpdate, isSearchPage = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCreator = user?.id === trip.creator_id;
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | undefined>(trip.request_status);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту поездку?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/trips/${trip.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete trip');
        }

        onDelete?.(trip.id);
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Не удалось удалить поездку');
      }
    }
  };

  const handleComplete = async () => {
    if (window.confirm('Вы уверены, что хотите завершить эту поездку?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/trips/${trip.id}/complete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to complete trip');
        }

        const updatedTrip = await response.json();
        onUpdate?.(trip.id, updatedTrip);
        navigate(`/trips/${trip.id}/reviews`);
      } catch (error) {
        console.error('Error completing trip:', error);
        alert(error instanceof Error ? error.message : 'Не удалось завершить поездку');
      }
    }
  };

  const handleUpdate = (updatedData: Partial<Trip>) => {
    onUpdate?.(trip.id, updatedData);
    setShowEditModal(false);
  };

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Необходимо авторизоваться');
        return;
      }

      const response = await fetch(`/api/trips/${trip.id}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send request');
      }

      setRequestStatus('pending');
      onUpdate?.(trip.id, { ...trip, request_status: 'pending' });
    } catch (error) {
      console.error('Error sending join request:', error);
      alert(error instanceof Error ? error.message : 'Не удалось отправить запрос');
    }
  };

  const getJoinButtonText = () => {
    switch (requestStatus) {
      case 'pending':
        return 'Запрос отправлен';
      case 'accepted':
        return 'Принято';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'Присоединиться';
    }
  };

  const isJoinButtonDisabled = () => {
    return requestStatus === 'pending' || requestStatus === 'accepted';
  };

  const handleOpenChat = () => {
    navigate('/chats');
  };

  return (
    <li className="trip-item">
      {isCreator && (
        <div className={`trip-status-tag status-${trip.status}`}>
          {getStatusText(trip.status)}
        </div>
      )}
      <div className="trip-main-content">
        <div className="trip-avatar">
          <Avatar name={trip.creator_name} url={trip.creator_avatar} size={120} />
          {(trip.status === 'planned' || trip.status === 'completed') && trip.companion_name && (
            <div className="companion-avatar">
              <div className="plus-icon">+</div>
              <Avatar name={trip.companion_name} url={trip.companion_avatar} size={60} />
            </div>
          )}
        </div>
        <div className="trip-info">
          <div className="trip-route">
            <strong>{trip.fromCity}</strong> &rarr; <strong>{trip.toCity}</strong>
          </div>
          <div className="trip-dates">
            {formatDate(trip.date_from)} — {formatDate(trip.date_to)}
          </div>
          <div className="creator-info">
            <div>{trip.creator_name}, {trip.creator_age}</div>
            <div>{trip.creator_city}</div>
          </div>
        </div>
      </div>
      <div className="trip-details">
        {trip.description && (
          <div className="trip-description">
            <em>Описание:</em> {trip.description}
          </div>
        )}
        {trip.companion_description && (
          <div className="trip-companion">
            <em>О попутчике:</em> {trip.companion_description}
          </div>
        )}
        <div className="trip-preferences">
          {trip.preferred_gender && (
            <div><em>Пол попутчика:</em> {trip.preferred_gender}</div>
          )}
          {(trip.preferred_age_min || trip.preferred_age_max) && (
            <div>
              <em>Возраст попутчика:</em> {trip.preferred_age_min || '?'} - {trip.preferred_age_max || '?'}
            </div>
          )}
          {trip.interests && trip.interests.length > 0 && (
            <div className="interests-container">
              <em>Интересы:</em>
              {trip.interests.map((interest, index) => (
                <span key={index} className="interest-tag">{interest}</span>
              ))}
            </div>
          )}
        </div>
        <div className="trip-footer">
          {trip.status === 'searching' && (
            <div className="created-at">
              {formatCreatedAt(trip.created_at)}
            </div>
          )}
        <div className="trip-actions">
          {isCreator && trip.status === 'searching' && (
            <>
              <button className="action-button" onClick={() => setShowEditModal(true)}>Редактировать</button>
              <button className="action-button action-button--danger" onClick={handleDelete}>Удалить</button>
            </>
          )}
          {isCreator && trip.status === 'planned' && (
            <>
             <button className="action-button action-button--primary" onClick={handleComplete}>Завершить</button>
              <button className="action-button" onClick={handleOpenChat}>Чат</button>
            </>
          )}
          {isCreator && trip.status === 'completed' && (
            trip.currentUserHasReviewed ? (
              <button className="action-button" onClick={() => navigate(`/trips/${trip.id}/reviews`)}>Посмотреть отзыв</button>
            ) : (
              <button className="action-button action-button--primary" onClick={() => navigate(`/trips/${trip.id}/reviews/new`)}>Написать отзыв</button>
            )
          )}
          {isSearchPage && !isCreator && (
            <button
              className="action-button action-button--join"
              onClick={handleJoin}
              disabled={isJoinButtonDisabled()}
              data-status={requestStatus}
            >
              {getJoinButtonText()}
            </button>
          )}
          {!isCreator && trip.companion_id === user?.id && (
            <>
              {trip.status === 'planned' && (
                <button className="action-button" onClick={handleOpenChat}>Чат</button>
              )}
              {trip.status === 'completed' && (
                trip.currentUserHasReviewed ? (
                  <button className="action-button" onClick={() => navigate(`/trips/${trip.id}/reviews`)}>Посмотреть отзыв</button>
                ) : (
                  <button className="action-button action-button--primary" onClick={() => navigate(`/trips/${trip.id}/reviews/new`)}>Написать отзыв</button>
                )
              )}
            </>
          )}
          </div>
        </div>
      </div>
      {showEditModal && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
        />
      )}
    </li>
  );
};

export default TripCard;
