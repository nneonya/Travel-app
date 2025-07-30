import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './LoginModal.css';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      onClose();
    } else {
      alert('Ошибка входа. Пожалуйста, проверьте ваши данные.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Авторизация</h2>
        <p>Рады видеть вас снова!</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-button">Войти</button>
        </form>
        <p>Нет аккаунта? <span className="switch-to-register" onClick={onSwitchToRegister}>Регистрация</span></p>
      </div>
    </div>
  );
};

export default LoginModal;
