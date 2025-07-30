import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Review } from '@/types/review';
import Avatar from '@/components/Avatar/Avatar';
import './ReviewList.css';

interface ReviewListProps {
  reviews: Review[];
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => void;
}

const MAX_TEXT_LENGTH = 200; // Максимальная длина текста для отображения

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleViewFull = (reviewId: number) => {
    navigate(`/reviews/${reviewId}`);
  };

  return (
    <div className="review-list">
      {reviews.map((review) => {
        const userName = review.user_name || 'Аноним';
        const userAvatar = review.user_avatar || undefined;
        const isTextLong = review.content.length > MAX_TEXT_LENGTH;
        const displayText = truncateText(review.content, MAX_TEXT_LENGTH);

        return (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-user">
                <Avatar url={userAvatar} name={userName} size={48} />
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {(review.trip_from_city && review.trip_to_city) && (
                    <div className="review-trip-route" style={{marginTop:8}}>
                      <span>{review.trip_from_city} &rarr; {review.trip_to_city}</span>
                    </div>
                  )}
                  {(review.trip_date_from && review.trip_date_to) && (
                    <div className="trip-dates" style={{marginTop:2, fontSize:'0.95em', color:'#6b7280'}}>
                      {new Date(review.trip_date_from).toLocaleDateString()} - {new Date(review.trip_date_to).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              {review.user_id && onEdit && onDelete && (
                <div className="review-actions">
                  <button
                    className="edit-button"
                    onClick={() => onEdit(review)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => onDelete(review.id)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            <div className="review-content">
              <h3 className="review-title">{review.title}</h3>
              <div className="review-rating">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={`star ${index < review.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="review-text">{displayText}</p>
              
              {isTextLong && (
                <div className="review-text-actions">
                  <button
                    className="view-full-button"
                    onClick={() => handleViewFull(review.id)}
                  >
                    Посмотреть полностью
                  </button>
                </div>
              )}
            </div>

            {/* Новый блок с маршрутами и датами поездки */}
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

            {review.photos && review.photos.length > 0 && (
              <div className="review-photos">
                {review.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Review photo"
                    className="review-photo"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList; 