import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '@/components/SearchForm/SearchForm';
import TripCard from '@/components/TripCard/TripCard';
import RegisterModal from '@/components/RegisterModal/RegisterModal';
import LoginModal from '@/components/LoginModal/LoginModal';
import './HomePage.css';

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

const HomePage: React.FC = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [fromCity, setFromCity] = useState<City | null>(null);
    const [toCity, setToCity] = useState<City | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [trips, setTrips] =useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/cities')
            .then(res => res.json())
            .then(data => setCities(data))
            .catch(() => { /* setError('Ошибка загрузки городов') */ });
    }, []);

    const fetchTrips = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            if (fromCity) params.append('from', String(fromCity.id));
            if (toCity) params.append('to', String(toCity.id));
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/trips?${params.toString()}`);
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);
            const data = await res.json();
            setTrips(data);
        } catch {
            // setError('Ошибка загрузки поездок');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleOpenRegisterModal = () => {
      setShowRegisterModal(true);
    };
  
    const handleCloseRegisterModal = () => {
      setShowRegisterModal(false);
    };
  
    const handleOpenLoginModal = () => {
      setShowLoginModal(true);
    };
  
    const handleCloseLoginModal = () => {
      setShowLoginModal(false);
    };
  
    const handleSwitchToRegister = () => {
      setShowLoginModal(false);
      setShowRegisterModal(true);
    };
  
    const handleSwitchToLogin = () => {
      setShowRegisterModal(false);
      setShowLoginModal(true);
    };

    const handleSearch = () => {
        navigate('/search', {
            state: {
                fromCity: fromCity?.name,
                toCity: toCity?.name,
                startDate,
                endDate,
            },
        });
    };
    

    return (
        <div className="home-page">
            <div className="hero-block">
                <h1>Найди попутчика для путешествий по Беларуси</h1>
                <p>Присоединяйся к сообществу путешественников и создавай незабываемые приключения вместе!</p>
                <ul>
                    <li>Создавай объявления о поездках и находи единомышленников</li>
                    <li>Общайся с попутчиками и планируйте маршруты вместе</li>
                    <li>Делись впечатлениями и находи новых друзей</li>
                </ul>
                <div className="auth-buttons">
                    <button onClick={handleOpenRegisterModal} className="register-button">
                        Зарегистрироваться
                    </button>
                    <button onClick={handleOpenLoginModal} className="login-button">
                        Войти
                    </button>
                </div>
            </div>

            <div className="search-section">
                <h2>Поиск объявлений</h2>
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
                    onSearch={handleSearch}
                />
            </div>

            <div className="recent-trips-section">
                <h2>Последние объявления</h2>
                <p>Посмотри, какие путешествия планируют другие</p>
                <div className="trip-list">
                    {trips.length === 0 ? (
                        <p className="no-trips-message">Поездок не найдено</p>
                    ) : (
                        trips.slice(0, 2).map(trip => (
                            <TripCard key={trip.id} trip={trip} />
                        ))
                    )}
                </div>
                <div className="buttons-section">
                    <button onClick={() => navigate('/search')} className="view-more-button">Посмотреть больше</button>
                    <button onClick={handleOpenRegisterModal} className="join-community-button">Присоединиться к сообществу</button>
                </div>
            </div>
            
            {showRegisterModal && (
              <RegisterModal 
                onClose={handleCloseRegisterModal} 
                onSwitchToLogin={handleSwitchToLogin} 
              />
            )}
      
            {showLoginModal && (
              <LoginModal 
                onClose={handleCloseLoginModal} 
                onSwitchToRegister={handleSwitchToRegister} 
              />
            )}
        </div>
    );
};

export default HomePage;
