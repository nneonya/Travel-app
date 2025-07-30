import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm/ReviewForm';
import Modal from '@/components/Modal/Modal';
import { Review } from '@/types/review';
import { api } from '@/services/api';
import './TripReviews.css';

interface TripData {
  id: number;
  fromCity: string;
  toCity: string;
  date_from: string;
  date_to: string;
  creator_name: string;
}

const TripReviews: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTripData = async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTripData(response.data);
    } catch (err) {
      console.error('Failed to fetch trip data:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews?trip_id=${tripId}`);
      setReviews(response.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить отзывы');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
    fetchReviews();
  }, [tripId]);

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError('Не удалось удалить отзыв');
      console.error(err);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };
  
  const handleSuccess = () => {
    handleModalClose();
    fetchReviews();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="trip-reviews-page">
        <div className="trip-reviews-content">
          <div className="loading">Загрузка отзывов...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-reviews-page">
        <div className="trip-reviews-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-reviews-page">
      <div className="trip-reviews-content">
        <button className="back-button" onClick={handleBack}>
          ← Назад
        </button>
        
        <div className="trip-reviews-header">
          <h1>
            {tripData
              ? `Отзывы о поездке "${tripData.fromCity} — ${tripData.toCity}"`
              : 'Отзывы о поездке'}
          </h1>
        </div>

        <div className="reviews-section">
          {reviews.length === 0 ? (
            <div className="no-reviews-message">
              <p>Пока нет отзывов об этой поездке.</p>
            </div>
          ) : (
            <ReviewList
              reviews={reviews}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
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

export default TripReviews; 