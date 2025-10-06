import { supabase, Novela, Movie, TVShow, Anime, CarouselItem, AppSettings } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}) => void;

class RealtimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribeToNovelas(callback: SubscriptionCallback<Novela>) {
    const channel = supabase
      .channel('novelas-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'novelas' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as Novela | null,
            old: payload.old as Novela | null,
          });
        }
      )
      .subscribe();

    this.channels.set('novelas', channel);
    return () => this.unsubscribe('novelas');
  }

  subscribeToMovies(callback: SubscriptionCallback<Movie>) {
    const channel = supabase
      .channel('movies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movies' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as Movie | null,
            old: payload.old as Movie | null,
          });
        }
      )
      .subscribe();

    this.channels.set('movies', channel);
    return () => this.unsubscribe('movies');
  }

  subscribeToTVShows(callback: SubscriptionCallback<TVShow>) {
    const channel = supabase
      .channel('tv-shows-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tv_shows' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as TVShow | null,
            old: payload.old as TVShow | null,
          });
        }
      )
      .subscribe();

    this.channels.set('tv_shows', channel);
    return () => this.unsubscribe('tv_shows');
  }

  subscribeToAnime(callback: SubscriptionCallback<Anime>) {
    const channel = supabase
      .channel('anime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'anime' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as Anime | null,
            old: payload.old as Anime | null,
          });
        }
      )
      .subscribe();

    this.channels.set('anime', channel);
    return () => this.unsubscribe('anime');
  }

  subscribeToCarousel(callback: SubscriptionCallback<CarouselItem>) {
    const channel = supabase
      .channel('carousel-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'carousel_items' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as CarouselItem | null,
            old: payload.old as CarouselItem | null,
          });
        }
      )
      .subscribe();

    this.channels.set('carousel_items', channel);
    return () => this.unsubscribe('carousel_items');
  }

  subscribeToSettings(callback: SubscriptionCallback<AppSettings>) {
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as AppSettings | null,
            old: payload.old as AppSettings | null,
          });
        }
      )
      .subscribe();

    this.channels.set('app_settings', channel);
    return () => this.unsubscribe('app_settings');
  }

  private unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  async getNovelas(): Promise<Novela[]> {
    const { data, error } = await supabase
      .from('novelas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addNovela(novela: Omit<Novela, 'id' | 'created_at' | 'updated_at'>): Promise<Novela> {
    const { data, error } = await supabase
      .from('novelas')
      .insert([novela])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNovela(id: string, updates: Partial<Novela>): Promise<Novela> {
    const { data, error } = await supabase
      .from('novelas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNovela(id: string): Promise<void> {
    const { error } = await supabase
      .from('novelas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getMovies(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addMovie(movie: Omit<Movie, 'id' | 'created_at' | 'updated_at'>): Promise<Movie> {
    const { data, error } = await supabase
      .from('movies')
      .insert([movie])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMovie(id: string, updates: Partial<Movie>): Promise<Movie> {
    const { data, error } = await supabase
      .from('movies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMovie(id: string): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getCarouselItems(): Promise<CarouselItem[]> {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addCarouselItem(item: Omit<CarouselItem, 'id' | 'created_at' | 'updated_at'>): Promise<CarouselItem> {
    const { data, error } = await supabase
      .from('carousel_items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCarouselItem(id: string, updates: Partial<CarouselItem>): Promise<CarouselItem> {
    const { data, error } = await supabase
      .from('carousel_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCarouselItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('carousel_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getSettings(key: string): Promise<AppSettings | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateSettings(key: string, value: any): Promise<AppSettings> {
    const { data: existing } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('app_settings')
        .insert([{ key, value }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getAllSettings(): Promise<AppSettings[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async exportFullBackup(): Promise<any> {
    const [novelas, movies, tvShows, anime, carouselItems, settings] = await Promise.all([
      this.getNovelas(),
      this.getMovies(),
      supabase.from('tv_shows').select('*').then(r => r.data || []),
      supabase.from('anime').select('*').then(r => r.data || []),
      supabase.from('carousel_items').select('*').then(r => r.data || []),
      this.getAllSettings(),
    ]);

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        novelas,
        movies,
        tv_shows: tvShows,
        anime,
        carousel_items: carouselItems,
        app_settings: settings,
      },
    };
  }

  async importFullBackup(backup: any): Promise<void> {
    const { data } = backup;

    if (data.app_settings) {
      for (const setting of data.app_settings) {
        await this.updateSettings(setting.key, setting.value);
      }
    }

    if (data.carousel_items) {
      for (const item of data.carousel_items) {
        const { id, created_at, updated_at, ...itemData } = item;
        await supabase.from('carousel_items').upsert([{ id, ...itemData }]);
      }
    }

    if (data.novelas) {
      for (const novela of data.novelas) {
        const { id, created_at, updated_at, ...novelaData } = novela;
        await supabase.from('novelas').upsert([{ id, ...novelaData }]);
      }
    }

    if (data.movies) {
      for (const movie of data.movies) {
        const { id, created_at, updated_at, ...movieData } = movie;
        await supabase.from('movies').upsert([{ id, ...movieData }]);
      }
    }

    if (data.tv_shows) {
      for (const show of data.tv_shows) {
        const { id, created_at, updated_at, ...showData } = show;
        await supabase.from('tv_shows').upsert([{ id, ...showData }]);
      }
    }

    if (data.anime) {
      for (const animeItem of data.anime) {
        const { id, created_at, updated_at, ...animeData } = animeItem;
        await supabase.from('anime').upsert([{ id, ...animeData }]);
      }
    }
  }
}

export const realtimeSyncService = new RealtimeSyncService();
