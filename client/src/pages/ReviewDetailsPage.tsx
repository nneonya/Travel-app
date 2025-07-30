import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, Typography, Button, Avatar, Box, Rating } from '@mui/material';
import { format } from 'date-fns';

interface Review {
  id: number;
  user_id: number;
  trip_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  trip: {
    title: string;
    destination: string;
  };
}

const ReviewDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`);
        setReview(response.data);
      } catch (err) {
        setError('Failed to load review details');
        console.error('Error fetching review:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`);
      navigate('/reviews');
    } catch (err) {
      setError('Failed to delete review');
      console.error('Error deleting review:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        Loading...
      </Box>
    );
  }

  if (error || !review) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" color="error.main">
        {error || 'Review not found'}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            {review.user.avatar_url ? (
              <Avatar
                src={review.user.avatar_url}
                alt={review.user.username}
                sx={{ width: 48, height: 48 }}
              />
            ) : (
              <Avatar sx={{ width: 48, height: 48 }}>
                {review.user.username[0].toUpperCase()}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6">{review.user.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(review.created_at), 'MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Trip: {review.trip.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Destination: {review.trip.destination}
            </Typography>
          </Box>

          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">Rating:</Typography>
              <Rating value={review.rating} readOnly />
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {review.comment}
            </Typography>
          </Box>

          {user && (user.id === review.user_id || user.is_admin) && (
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/reviews/${id}/edit`)}
              >
                Edit Review
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                Delete Review
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewDetailsPage; 