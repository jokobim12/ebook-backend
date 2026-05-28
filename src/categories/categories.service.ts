import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CategoriesService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.getClient()
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(name: string, order?: number) {
    const { data, error } = await this.supabase.getClient()
      .from('categories')
      .insert({ name, order: order || 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, name: string) {
    const { data, error } = await this.supabase.getClient()
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase.getClient()
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
