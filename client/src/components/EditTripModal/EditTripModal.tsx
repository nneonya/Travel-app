import React, { useState } from 'react';
import './EditTripModal.css';

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
}

interface EditTripModalProps {
  trip: Trip;
  onClose: () => void;
  onSave: (updatedData: Partial<Trip>) => void;
}

const EditTripModal: React.FC<EditTripModalProps> = ({ trip, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fromCity: trip.fromCity || '',
    toCity: trip.toCity || '',
    date_from: trip.date_from.split('T')[0],
    date_to: trip.date_to.split('T')[0],
    description: trip.description || '',
    companion_description: trip.companion_description || '',
    preferred_gender: trip.preferred_gender || '',
    preferred_age_min: trip.preferred_age_min || '',
    preferred_age_max: trip.preferred_age_max || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update trip');
      }

      const updatedTrip = await response.json();
      onSave(updatedTrip);
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Не удалось обновить поездку');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Редактирование поездки</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fromCity">Откуда</label>
            <input
              type="text"
              id="fromCity"
              name="fromCity"
              value={formData.fromCity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="toCity">Куда</label>
            <input
              type="text"
              id="toCity"
              name="toCity"
              value={formData.toCity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_from">Дата отправления</label>
              <input
                type="date"
                id="date_from"
                name="date_from"
                value={formData.date_from}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_to">Дата возвращения</label>
              <input
                type="date"
                id="date_to"
                name="date_to"
                value={formData.date_to}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание поездки</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companion_description">О попутчике</label>
            <textarea
              id="companion_description"
              name="companion_description"
              value={formData.companion_description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferred_gender">Пол попутчика</label>
              <select
                id="preferred_gender"
                name="preferred_gender"
                value={formData.preferred_gender}
                onChange={handleChange}
              >
                <option value="">Не важно</option>
                <option value="мужчина">Мужчина</option>
                <option value="женщина">Женщина</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferred_age_min">Минимальный возраст</label>
              <input
                type="number"
                id="preferred_age_min"
                name="preferred_age_min"
                value={formData.preferred_age_min}
                onChange={handleChange}
                min="18"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferred_age_max">Максимальный возраст</label>
              <input
                type="number"
                id="preferred_age_max"
                name="preferred_age_max"
                value={formData.preferred_age_max}
                onChange={handleChange}
                min="18"
                max="100"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-button">Сохранить</button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTripModal; 