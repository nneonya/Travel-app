import React, { useState } from 'react';
import { Review } from '@/types/review';
import { useAuth } from '@/context/AuthContext';
import './ReviewList.css';

interface ReviewListProps {
  reviews: Review[];
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-main-content">
              <img 
                src={review.user_avatar ? `http://localhost:5000${review.user_avatar}` : '/default-avatar.png'} 
                alt={review.user_name}
                className="review-avatar"
              />
              <div className="review-info">
                <div className="review-header">
                  <div className="review-user-info">
                    <h3 className="review-user-name">{review.user_name}</h3>
                    <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  {user && review.user_id === user.id && (
                    <div className="review-actions">
                      <button className="edit-button" onClick={() => onEdit(review)}>
                        Редактировать
                      </button>
                      <button className="delete-button" onClick={() => onDelete(review.id)}>
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
                <h4 className="review-title">{review.title}</h4>
                {(review.trip_from_city && review.trip_to_city) || (review.trip_date_from && review.trip_date_to) ? (
                  <div className="review-trip">
                    {(review.trip_from_city && review.trip_to_city) && (
                      <div className="review-trip-route">
                        <span className="trip-cities">
                          {review.trip_from_city} &rarr; {review.trip_to_city}
                        </span>
                      </div>
                    )}
                    {(review.trip_date_from && review.trip_date_to) && (
                      <div className="trip-dates">
                        {new Date(review.trip_date_from).toLocaleDateString()} - {new Date(review.trip_date_to).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="review-rating">
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className={`star ${index < review.rating ? 'active' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="review-content">{review.content}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="review-photos">
                    {review.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={`http://localhost:5000/public${photo.url}`}
                        alt="Фото отзыва"
                        className="review-photo"
                        onClick={() => handlePhotoClick(`http://localhost:5000/public${photo.url}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedPhoto && (
        <div className="photo-modal" onClick={handleCloseModal}>
          <div className="photo-modal-content">
            <img src={selectedPhoto} alt="Фото отзыва" />
            <button className="close-modal" onClick={handleCloseModal}>×</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewList; 