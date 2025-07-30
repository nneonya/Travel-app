import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Footer.css';

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-content">
        <Link to="/" className="footer-link">Главная</Link>
        <Link to="/search" className="footer-link">Объявления</Link>
        {isAuthenticated && (
          <>
            <Link to="/my-trips" className="footer-link">Мои поездки</Link>
            <Link to="/chats" className="footer-link">Чаты</Link>
            <Link to="/notifications" className="footer-link">Уведомления</Link>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;
