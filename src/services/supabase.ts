import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Novela {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: 'streaming' | 'finished';
  episodes: number;
  genre: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: string;
  tmdb_id?: number;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  genre: string;
  year: number;
  rating: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface TVShow {
  id: string;
  tmdb_id?: number;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  genre: string;
  year: number;
  rating: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Anime {
  id: string;
  tmdb_id?: number;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  genre: string;
  year: number;
  rating: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  image_url: string;
  content_type: 'movie' | 'tv' | 'anime' | 'novela';
  content_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}
