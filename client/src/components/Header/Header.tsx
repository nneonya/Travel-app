import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal/LoginModal';
import RegisterModal from '@/components/RegisterModal/RegisterModal';
import NotificationDropdown from '@/components/NotificationDropdown/NotificationDropdown';
import { IoChatbubbles, IoNotifications } from "react-icons/io5";
import logo from '@/assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleOpenRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="header">
      <nav className="header-nav">
        {isAuthenticated ? (
          <>
            <div className="header-left">
              <Link to="/" className="header-logo">
                <img src={logo} alt="Дневник Путешествий" className="header-logo-img" />
              </Link>
              <Link to="/" className="header-link">Главная</Link>
              <Link to="/search" className="header-link">Объявления</Link>
              <Link to="/reviews" className="header-link">Отзывы</Link>
              <Link to="/my-trips" className="header-link">Мои поездки</Link>
              <b><Link to="/create-trip" className="header-link">Создать поездку</Link></b>
            </div>
            <div className="header-right">
              <Link to="/chats" className="header-link" title="Чаты">
                <IoChatbubbles size={24} />
              </Link>
              <div className="notifications-container">
                <button 
                  className="header-link notification-button" 
                  title="Уведомления"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                <IoNotifications size={24} />
                </button>
                <NotificationDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>
              <div className="header-auth">
                <button onClick={handleProfileClick} className="header-profile-button">Профиль</button>
                <button onClick={logout} className="header-log-button">Выйти</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="header-left">
              <Link to="/" className="header-logo">
                <img src={logo} alt="Дневник Путешествий" className="header-logo-img" />
              </Link>
              <Link to="/" className="header-link">Главная</Link>
              <Link to="/search" className="header-link">Объявления</Link>
            </div>
            <div className="header-right">
              <div className="header-auth">
                <button onClick={handleOpenRegisterModal} className="header-register-button">Зарегистрироваться</button>
                <button onClick={handleOpenLoginModal} className="header-log-button">Войти</button>
              </div>
            </div>
          </>
        )}
      </nav>

      {showLoginModal && (
        <LoginModal onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} />
      )}

      {showRegisterModal && (
        <RegisterModal onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </header>
  );
};

export default Header;
