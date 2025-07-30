import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';
import './CreateReviewPage.css';
import ReviewForm from '@/components/ReviewForm/ReviewForm';
import '@/components/ReviewForm/ReviewForm.css';

interface Trip {
  id: number;
  title?: string;
  fromCity?: string;
  toCity?: string;
  destination?: string;
  date_from?: string;
  date_to?: string;
  description?: string;
}

const CreateReviewPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const [selectedTrip, setSelectedTrip] = useState<number | ''>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripInfo, setTripInfo] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading] = useState(false);

  // Fetch available trips if no tripId is provided
  useEffect(() => {
    if (!tripId) {
      const fetchTrips = async () => {
        try {
          const response = await api.get(`/trips`);
          setTrips(response.data);
        } catch (err) {
          console.error('Error fetching trips:', err);
          setError('Failed to load trips');
        }
      };
      fetchTrips();
    } else {
      // Если tripId есть, получаем инфо о поездке отдельно
      const fetchTrip = async () => {
        try {
          const response = await api.get(`/trips/${tripId}`);
          setTripInfo(response.data);
        } catch {
          setTripInfo(null);
        }
      };
      fetchTrip();
    }
  }, [tripId]);

  // Обновлять tripInfo при выборе поездки из списка
  useEffect(() => {
    if (!tripId && selectedTrip && trips.length > 0) {
      const found = trips.find(t => t.id === Number(selectedTrip));
      setTripInfo(found || null);
    }
  }, [selectedTrip, trips, tripId]);

  const handleSuccess = () => {
    navigate('/reviews');
  };

  return (
    <div className="review-form">
      <h2>Создание отзыва</h2>
      {error && <div className="error-message">{error}</div>}
      {!tripId && (
        <div className="form-group">
          <label htmlFor="trip">Выберите поездку</label>
          <select
            id="trip"
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(Number(e.target.value))}
            disabled={loading}
          >
            <option value="">Выберите поездку</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title || `${trip.fromCity || ''} → ${trip.toCity || ''}`}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Блок информации о поездке */}
      {tripInfo && (
        <div className="trip-info" style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#1E1B4B', fontSize: 20, margin: 0 }}>
            {tripInfo.title || `${tripInfo.fromCity || ''} → ${tripInfo.toCity || ''}`}
          </h3>
          <div style={{ color: '#4b5563', margin: '8px 0', fontSize: 16 }}>
            <b>Маршрут:</b> {tripInfo.fromCity && tripInfo.toCity 
              ? `${tripInfo.fromCity} → ${tripInfo.toCity}` 
              : tripInfo.destination || 'Не указан'}
          </div>
          {tripInfo.date_from && tripInfo.date_to && (
            <div className="trip-dates" style={{ color: '#1E1B4B', fontWeight: 500 }}>
              {new Date(tripInfo.date_from).toLocaleDateString()} — {new Date(tripInfo.date_to).toLocaleDateString()}
            </div>
          )}
          {tripInfo.description && (
            <div style={{ color: '#4b5563', marginTop: 8 }}>{tripInfo.description}</div>
          )}
        </div>
      )}
      {(tripId || selectedTrip) && (
        <ReviewForm
          tripId={tripId ? Number(tripId) : Number(selectedTrip)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default CreateReviewPage; 