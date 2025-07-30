import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import TripCard from '@/components/TripCard/TripCard';
import './MyTripsPage.css';

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
  created_at: string;
}

type TripStatus = 'searching' | 'planned' | 'completed';

const MyTripsPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeStatus, setActiveStatus] = useState<TripStatus>('searching');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trips/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      // Remove any potential duplicates by using a Map with trip ID as key
      const uniqueTrips = Array.from(
        new Map(data.map((trip: Trip) => [trip.id, trip])).values()
      ) as Trip[];
      setTrips(uniqueTrips);
    } catch (err) {
      setError('Ошибка загрузки поездок');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleDelete = async (tripId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      // Update local state by filtering out the deleted trip
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Не удалось удалить поездку');
    }
  };

  const handleUpdate = async (tripId: number, updatedData: Partial<Trip>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update trip');
      }

      // Update local state by mapping over trips and updating the matching one
      setTrips(prevTrips =>
        prevTrips.map(trip =>
          trip.id === tripId ? { ...trip, ...updatedData } : trip
        )
      );
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Не удалось обновить поездку');
    }
  };

  const filteredTrips = trips.filter(trip => trip.status === activeStatus);

  const statusTabs = [
    { status: 'searching', label: 'В поиске попутчика' },
    { status: 'planned', label: 'Запланировано' },
    { status: 'completed', label: 'Завершено' }
  ];

  return (
    <div className="my-trips-page">
      <div className="my-trips-content">
        <h1>Мои поездки</h1>
        <div className="status-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.status}
              className={`status-tab ${activeStatus === tab.status ? 'active' : ''}`}
              onClick={() => setActiveStatus(tab.status as TripStatus)}
            >
              {tab.label}
              <span className="trip-count">
                {trips.filter(trip => trip.status === tab.status).length}
              </span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredTrips.length === 0 ? (
          <div className="no-trips-message">
            {activeStatus === 'searching'
              ? 'У вас пока нет активных поездок'
              : activeStatus === 'planned'
              ? 'У вас пока нет запланированных поездок'
              : 'У вас пока нет завершенных поездок'}
          </div>
        ) : (
          <div className="trip-list">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="trip-list-item">
                <TripCard
                  trip={trip}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage; 