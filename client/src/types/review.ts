export interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  photos: {
    id: number;
    url: string;
  }[];
  trip_id: number;
  trip_from_city: string;
  trip_to_city: string;
  trip_date_from: string;
  trip_date_to: string;
} 