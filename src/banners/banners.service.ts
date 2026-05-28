import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BannersService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.getClient()
      .from('banners')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(banner: { title: string; image_url: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('banners')
      .insert(banner)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: { title?: string; image_url?: string }) {
    const { data, error } = await this.supabase.getClient()
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase.getClient()
      .from('banners')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
