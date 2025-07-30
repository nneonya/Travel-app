import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { api } from '@/services/api';
import { Trip } from '@/types/trip';

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trips/${id}`);
        setTrip(response.data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch trip:', err);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Trip not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trip Details
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Route</Typography>
          <Typography>
            {trip.from_city} → {trip.to_city}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Dates</Typography>
          <Typography>
            {new Date(trip.date_from).toLocaleDateString()} - {new Date(trip.date_to).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Description</Typography>
          <Typography>{trip.description}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/trips/${id}/reviews`)}
          >
            View Reviews
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TripDetailsPage; 