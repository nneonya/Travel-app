import React, { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import ReviewList from '@/components/ReviewList';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal/Modal';
import ReviewForm from '@/components/ReviewForm/ReviewForm';
import { api } from '@/services/api';
import './ReviewsPage.css';

type SortOption = 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';

interface City {
  id: number;
  name: string;
}

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [pendingCity, setPendingCity] = useState<string>('');
  const [pendingSearch, setPendingSearch] = useState<string>('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      if (response.status !== 200) {
        throw new Error('Failed to load cities');
      }
      setCities(response.data);
    } catch (err) {
      console.error('Error loading cities:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      if (response.status !== 200) {
        throw new Error('Failed to load reviews');
      }
      setReviews(response.data);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchReviews();
  };

  const sortReviews = (reviews: Review[]) => {
    return [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest_rating':
          return b.rating - a.rating;
        case 'lowest_rating':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesCity = !filterCity || 
      review.trip_from_city.toLowerCase().includes(filterCity.toLowerCase()) ||
      review.trip_to_city.toLowerCase().includes(filterCity.toLowerCase());
    const matchesSearch = !searchQuery || 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' 
      ? review.user_id !== user?.id 
      : review.user_id === user?.id;

    return matchesCity && matchesSearch && matchesTab;
  });

  const sortedReviews = sortReviews(filteredReviews);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="reviews-page">
      <div className="reviews-content">
        <h1>Отзывы о поездках</h1>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Все отзывы
          </button>
          <button 
            className={`tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            Мои отзывы
          </button>
        </div>
        
        <div className="filters-panel">
          <form className="filters-row" onSubmit={e => {e.preventDefault(); setFilterCity(pendingCity); setSearchQuery(pendingSearch);}}>
            <div className="filter-group city-group">
              <select
                value={pendingCity}
                onChange={(e) => setPendingCity(e.target.value)}
                className="city-select"
              >
                <option value="">Все города</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group search-group">
              <input
                type="text"
                placeholder="Поиск"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="find-button">Найти</button>
          </form>
        </div>

        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Сначала новые
          </button>
          <button 
            className={`sort-button ${sortBy === 'oldest' ? 'active' : ''}`}
            onClick={() => setSortBy('oldest')}
          >
            Сначала старые
          </button>
          <button 
            className={`sort-button ${sortBy === 'highest_rating' ? 'active' : ''}`}
            onClick={() => setSortBy('highest_rating')}
          >
            Высокий рейтинг
          </button>
          <button 
            className={`sort-button ${sortBy === 'lowest_rating' ? 'active' : ''}`}
            onClick={() => setSortBy('lowest_rating')}
          >
            Низкий рейтинг
          </button>
        </div>

        {sortedReviews.length === 0 ? (
          <p className="no-reviews">
            {activeTab === 'all' ? 'Пока нет отзывов' : 'У вас пока нет отзывов'}
          </p>
        ) : (
          <ReviewList
            reviews={sortedReviews}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingReview ? 'Редактировать отзыв' : 'Написать отзыв'}
      >
        {editingReview && (
          <ReviewForm
            tripId={editingReview.trip_id}
            initialData={editingReview}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </div>
  );
};

export default ReviewsPage; 