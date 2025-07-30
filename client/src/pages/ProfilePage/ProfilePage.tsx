import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripCard from '@/components/TripCard/TripCard';
import Avatar from '@/components/Avatar/Avatar';
import api from '@/api/api';
import axios from 'axios';
import './ProfilePage.css';

interface UserProfile {
  name: string;
  age: number;
  city_id: number;
  cityName: string;
  avatar: string;
  description: string;
  gender: string;
  interests: string[];
}

interface Trip {
  id: number;
  creator_id: number;
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
  fromCity: string;
  toCity: string;
  creator_name: string;
  creator_age: number;
  creator_city: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        console.log('Profile data:', data);
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Ошибка загрузки профиля');
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/');
        }
      }
    };

    const fetchUserTrips = async () => {
      try {
        const { data } = await api.get('/users/my-trips');
        console.log('Trips data in profile:', data);
        console.log('First trip cities:', data[0]?.fromCity, data[0]?.toCity);
        setTrips(data);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Ошибка загрузки поездок');
      }
      setLoading(false);
    };

    fetchProfile();
    fetchUserTrips();
  }, [navigate]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div className="error-message">Профиль не найден</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <Avatar 
              url={profile.avatar} 
              name={profile.name}
              size={200}
            />
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <div className="profile-details">
              <span className="profile-age">{profile.age} лет</span>
              {profile.cityName && <span className="profile-city">г. {profile.cityName}</span>}
              <span className="profile-gender">{
                profile.gender === 'male' ? 'Мужчина' :
                profile.gender === 'female' ? 'Женщина' :
                ''
              }</span>
            </div>
            {profile.interests && profile.interests.length > 0 && (
              <div className="profile-interests">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            )}
            <p className="profile-description">{profile.description}</p>
            <button 
              onClick={() => navigate('/profile/edit')} 
              className="edit-profile-button"
            >
              Редактировать профиль
            </button>
          </div>
        </div>

        <div className="profile-trips">
          <h2>Мои последние поездки</h2>
          {trips.length > 0 ? (
            <>
              <div className="trip-list">
                {trips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <div className="view-all-trips">
                <button 
                  onClick={() => navigate('/my-trips')} 
                  className="view-all-button"
                >
                  Все поездки
                </button>
              </div>
            </>
          ) : (
            <p className="no-trips">У вас пока нет созданных поездок</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 