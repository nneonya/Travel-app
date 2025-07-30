import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewForm from '@/components/ReviewForm/ReviewForm';
import { api } from '@/services/api';
import { Review } from '@/types/review';

const EditReviewPage: React.FC = () => {
  const { tripId, reviewId } = useParams<{ tripId: string; reviewId: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reviews/${reviewId}`).then(res => {
      setReview(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [reviewId]);

  if (loading) return <div>Загрузка...</div>;
  if (!review) return <div>Отзыв не найден</div>;

  return (
    <div className="edit-review-page">
      <h1>Редактировать отзыв</h1>
      <ReviewForm
        tripId={Number(tripId)}
        initialData={review}
        onSuccess={() => navigate(`/trips/${tripId}/reviews`)}
      />
    </div>
  );
};

export default EditReviewPage; 