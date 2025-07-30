// src/types.ts
export interface City {
    id: number;
    name: string;
  }
  
  export interface Trip {
    id: number;
    creator_id: number;
    from_city_id: number;
    to_city_id: number;
    date_from: string;
    date_to: string;
    description: string;
    companion_description: string;
    preferred_gender: string;
    preferred_age_min: number;
    preferred_age_max: number;
    interests: string[];
    status: string;
    created_at: string;
  
    // Дополнительные поля, если ты в бэке добавляешь названия городов
    fromCity?: string;
    toCity?: string;
  }
  
  export interface SearchParams {
    from_city_id?: number;
    to_city_id?: number;
    date_from?: string;
    date_to?: string;
  }