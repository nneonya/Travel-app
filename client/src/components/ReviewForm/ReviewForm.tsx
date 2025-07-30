import React, { useState } from 'react';
import { Box, TextField, Button, Rating, Typography } from '@mui/material';
import { Review } from '@/types/review';
import { api } from '@/services/api';

interface ReviewFormProps {
  tripId: number;
  onSuccess: () => void;
  initialData?: Review;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ tripId, onSuccess, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [rating, setRating] = useState<number | null>(initialData?.rating || 0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Пожалуйста, введите заголовок отзыва');
      return;
    }

    if (!content.trim()) {
      setError('Пожалуйста, введите текст отзыва');
      return;
    }

    if (!rating) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('rating', rating.toString());
      formData.append('trip_id', tripId.toString());
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      if (initialData) {
        await api.put(`/reviews/${initialData.id}`, formData);
      } else {
        await api.post(`/reviews`, formData);
      }
      onSuccess();
    } catch (err) {
      setError('Произошла ошибка при сохранении отзыва');
      console.error(err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.back();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', paddingTop: '24px', borderTop: '1px solid #eee' }}>
      <TextField
        fullWidth
        label="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Текст отзыва"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
      />
      <Box sx={{ my: 2 }}>
        <Typography component="legend">Оценка</Typography>
        <Rating
          value={rating}
          onChange={(_, value) => setRating(value)}
          precision={0.5}
          size="large"
        />
      </Box>
      <Box sx={{ my: 2 }}>
        <input
          accept="image/*"
          type="file"
          multiple
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <label htmlFor="photo-upload">
          <Button variant="outlined" component="span">
            Добавить фото
          </Button>
        </label>
        {photos.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Выбрано фото: {photos.length}
          </Typography>
        )}
        {photos.length > 0 && (
          <div className="photo-preview">
            {photos.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div className="photo-preview-item" key={idx}>
                  <img src={url} alt={`preview-${idx}`} />
                  <button type="button" className="remove-photo" onClick={() => handleRemovePhoto(idx)} title="Удалить фото">×</button>
                </div>
              );
            })}
          </div>
        )}
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <div className="form-buttons">
        <button type="submit" className="submit">
          {initialData ? 'Сохранить изменения' : 'Опубликовать отзыв'}
        </button>
        <button type="button" className="cancel" onClick={handleCancel}>
          Отмена
        </button>
      </div>
    </Box>
  );
};

export default ReviewForm; 