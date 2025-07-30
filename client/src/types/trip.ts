export interface Trip {
  id: number;
  creator_id: number;
  from_city_id: number;
  to_city_id: number;
  from_city: string;
  to_city: string;
  date_from: string;
  date_to: string;
  description: string;
  companion_description: string;
  preferred_gender: string | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  interests: string[];
  status: 'searching' | 'planned' | 'completed' | 'cancelled';
  created_at: string;
} 