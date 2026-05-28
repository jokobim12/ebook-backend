import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FeaturedService {
  constructor(private supabase: SupabaseService) {}

  async getAll() {
    const { data, error } = await this.supabase.getClient()
      .from('featured_ebooks')
      .select('*, ebooks(*)')
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  }

  async set(items: { ebook_id: string; position: number }[]) {
    // Clear all existing featured
    await this.supabase.getClient()
      .from('featured_ebooks')
      .delete()
      .gte('position', 1);

    // Insert new featured list
    if (items.length > 0) {
      const { data, error } = await this.supabase.getClient()
        .from('featured_ebooks')
        .insert(items)
        .select('*, ebooks(*)');
      if (error) throw error;
      return data;
    }
    return [];
  }

  async remove(ebookId: string) {
    const { error } = await this.supabase.getClient()
      .from('featured_ebooks')
      .delete()
      .eq('ebook_id', ebookId);
    if (error) throw error;
    return { success: true };
  }
}
