import React from 'react';
import Select from 'react-select';
import { FaArrowRight, FaMinus } from 'react-icons/fa';
import './SearchForm.css';

interface City {
  id: number;
  name: string;
}

interface SearchFormProps {
  cities: City[];
  fromCity: City | null;
  setFromCity: (city: City | null) => void;
  toCity: City | null;
  setToCity: (city: City | null) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  loading: boolean;
  onSearch: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  cities,
  fromCity,
  setFromCity,
  toCity,
  setToCity,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  loading,
  onSearch,
}) => {
  const cityOptions = cities.map(city => ({
    value: city.id,
    label: city.name,
  }));

  return (
    <div className="search-form">
      <div className="form-group">
        <label>Откуда едем</label>
        <Select
          options={cityOptions}
          value={fromCity ? { value: fromCity.id, label: fromCity.name } : null}
          onChange={option => {
            if (option) setFromCity({ id: option.value, name: option.label });
            else setFromCity(null);
          }}
          isClearable
          placeholder="Выберите город"
          classNamePrefix="select"
        />
      </div>

      <div className="arrow-icon">
        <FaArrowRight />
      </div>

      <div className="form-group">
        <label>Куда едем</label>
        <Select
          options={cityOptions}
          value={toCity ? { value: toCity.id, label: toCity.name } : null}
          onChange={option => {
            if (option) setToCity({ id: option.value, name: option.label });
            else setToCity(null);
          }}
          isClearable
          placeholder="Выберите город"
          classNamePrefix="select"
        />
      </div>

      <div className="form-group">
        <label>Туда</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          max={endDate || undefined}
          className="date-input"
          placeholder="20.07.25"
        />
      </div>

      <div className="arrow-icon">
        <FaMinus />
      </div>

      <div className="form-group">
        <label>Обратно</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          min={startDate || undefined}
          className="date-input"
          placeholder="23.07.25"
        />
      </div>

      <button onClick={onSearch} disabled={loading} className="search-button">
        {loading ? 'Идёт поиск...' : 'Найти'}
      </button>
    </div>
  );
};

export default SearchForm;
