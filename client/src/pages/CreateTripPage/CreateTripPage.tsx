import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '@/api/api';
import './CreateTripPage.css';

interface City {
  id: number;
  name: string;
}

interface OptionType {
  value: number;
  label: string;
}

const CreateTripPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [fromCity, setFromCity] = useState<OptionType | null>(null);
  const [toCity, setToCity] = useState<OptionType | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [description, setDescription] = useState('');
  const [companionDescription, setCompanionDescription] = useState('');
  const [preferredGender, setPreferredGender] = useState('');
  const [preferredAgeMin, setPreferredAgeMin] = useState('');
  const [preferredAgeMax, setPreferredAgeMax] = useState('');
  const [interests, setInterests] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cities')
      .then(res => {
        setCities(res.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки городов:', err);
      });
  }, []);

  const cityOptions: OptionType[] = cities.map(city => ({
    value: city.id,
    label: city.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCity || !toCity) {
      alert('Пожалуйста, выберите города отправления и назначения');
      return;
    }

    if (dateFrom && dateTo && dateTo < dateFrom) {
      alert('Дата окончания не может быть раньше даты начала');
      return;
    }

    try {
      await api.post('/trips', {
        from_city_id: fromCity.value,
        to_city_id: toCity.value,
        date_from: dateFrom,
        date_to: dateTo,
        description,
        companion_description: companionDescription,
        preferred_gender: preferredGender,
        preferred_age_min: preferredAgeMin ? Number(preferredAgeMin) : null,
        preferred_age_max: preferredAgeMax ? Number(preferredAgeMax) : null,
        interests: interests ? interests.split(',').map(s => s.trim()) : [],
      });
      navigate('/');
    } catch (err) {
      console.error('Ошибка при создании поездки:', err);
      alert('Ошибка при создании поездки. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="create-trip-page">
      <div className="create-trip-container">
        <h2>Создать новую поездку</h2>
        <p>Заполните информацию о вашем путешествии</p>
        <form onSubmit={handleSubmit}>
          <div className="trip-section">
            <label>
              Откуда едем
              <Select
                options={cityOptions}
                value={fromCity}
                onChange={setFromCity}
                placeholder="Выберите"
              />
            </label>
            <label>
              Куда едем
              <Select
                options={cityOptions}
                value={toCity}
                onChange={setToCity}
                placeholder="Выберите"
              />
            </label>
          </div>

          <div className="trip-section">
            <label>
              Дата начала
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
              />
            </label>
            <label>
              Дата окончания
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
              />
            </label>
          </div>

          <label>
            О поездке
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <hr style={{ margin: '25px 0' }} />

          <h3 style={{ fontSize: '16px', color: '#2c2d5b' }}>Пожелания к попутчику</h3>

          <div className="trip-section">
            <label>
              Пол
              <select
                value={preferredGender}
                onChange={(e) => setPreferredGender(e.target.value)}
              >
                <option value="">Не важен</option>
                <option value="мужчина">Мужчина</option>
                <option value="женщина">Женщина</option>
              </select>
            </label>
            <label>
              Возраст
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={preferredAgeMin}
                  onChange={(e) => setPreferredAgeMin(e.target.value)}
                  min={0}
                />
                <input
                  type="number"
                  placeholder="До"
                  value={preferredAgeMax}
                  onChange={(e) => setPreferredAgeMax(e.target.value)}
                  min={0}
                />
              </div>
            </label>
          </div>

          <label>
            Дополнительные требования
            <textarea
              value={companionDescription}
              onChange={(e) => setCompanionDescription(e.target.value)}
            />
          </label>

          <label>
            Интересы
            <input
              type="text"
              placeholder="Добавьте интересы через запятую"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </label>

          <div className="trip-buttons">
            <button type="button" className="cancel" onClick={() => navigate(-1)}>Отмена</button>
            <button type="submit" className="submit">Создать поездку</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;
