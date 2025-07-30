import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SearchForm from '@/components/SearchForm/SearchForm';
import TripCard from '@/components/TripCard/TripCard';
import './SearchPage.css';

type City = { id: number; name: string };

interface Trip {
  id: number;
  from_city_id: number;
  to_city_id: number;
  date_from: string;
  date_to: string;
  description: string;
  companion_description: string;
  preferred_gender: string;
  preferred_age_min: number;
  preferred_age_max: number;
  interests: string[];
  status: string;
  created_at: string;
  fromCity?: string;
  toCity?: string;
  creator_name: string;
  creator_age: number;
  creator_city: string;
  creator_id: number;
}

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [fromCity, setFromCity] = useState<City | null>(null);
  const [toCity, setToCity] = useState<City | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(() => setError('Ошибка загрузки городов'));
  }, []);

  useEffect(() => {
    if (location.state) {
      setFromCity(location.state.fromCity);
      setToCity(location.state.toCity);
      setStartDate(location.state.startDate);
      setEndDate(location.state.endDate);
    }
  }, [location.state]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (fromCity) params.append('from', String(fromCity.id));
      if (toCity) params.append('to', String(toCity.id));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/trips?${params.toString()}`);
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      // Filter out user's own trips only if user is logged in
      const filteredTrips = user 
        ? data.filter((trip: Trip) => trip.creator_id !== user.id)
        : data;
      setTrips(filteredTrips);
    } catch {
      setError('Ошибка загрузки поездок');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем все поездки при первом открытии, если параметры не заданы
  useEffect(() => {
    if (!fromCity && !toCity && !startDate && !endDate) {
      fetchTrips();
    }
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="search-page">
      <div className="search-page-content">
        <h1>Поиск поездок</h1>
        <div className="search-form-wrapper">
          <SearchForm
            cities={cities}
            fromCity={fromCity}
            setFromCity={setFromCity}
            toCity={toCity}
            setToCity={setToCity}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            loading={loading}
            onSearch={fetchTrips}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="trip-list">
          {trips.length === 0 ? (
            <p className="no-trips-message">Поездок не найдено</p>
          ) : (
            trips.map(trip => (
              <div key={trip.id} className="trip-list-item">
                <TripCard trip={trip} isSearchPage={true} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
