import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class EbooksService {
  constructor(private supabase: SupabaseService) {}

  async findAll(category?: string) {
    let query = this.supabase.getClient()
      .from('ebooks')
      .select('*, users!author_id(name), ebook_pages(id, chapter, order)')
      .order('created_at', { ascending: false });

    if (category && category !== 'Semua') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    // Flatten author name
    return (data || []).map((book: any) => ({
      ...book,
      author_name: book.users?.name || 'Anonim',
    }));
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('ebooks')
      .select('*, users!author_id(name), ebook_pages(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      author_name: data?.users?.name || 'Anonim',
    };
  }

  async findByAuthor(authorId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('ebooks')
      .select('*, ebook_pages(id, chapter, order)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async create(ebook: any) {
    const { data, error } = await this.supabase.getClient()
      .from('ebooks')
      .insert(ebook)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: any) {
    const { data, error } = await this.supabase.getClient()
      .from('ebooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    // Delete pages first
    await this.supabase.getClient().from('ebook_pages').delete().eq('ebook_id', id);
    const { error } = await this.supabase.getClient().from('ebooks').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  // Pages
  async getPages(ebookId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('ebook_pages')
      .select('*')
      .eq('ebook_id', ebookId)
      .order('order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async savePage(ebookId: string, page: any) {
    if (page.id) {
      const { data, error } = await this.supabase.getClient()
        .from('ebook_pages')
        .update(page)
        .eq('id', page.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.getClient()
        .from('ebook_pages')
        .insert({ ...page, ebook_id: ebookId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async deletePage(pageId: string) {
    const { error } = await this.supabase.getClient()
      .from('ebook_pages')
      .delete()
      .eq('id', pageId);
    if (error) throw error;
    return { success: true };
  }

  async incrementViews(id: string) {
    const { error } = await this.supabase.getClient()
      .rpc('increment_views', { ebook_id: id });
    if (error) {
      // Fallback: manual increment
      const book = await this.findById(id);
      if (book) {
        await this.supabase.getClient()
          .from('ebooks')
          .update({ views: (book.views || 0) + 1 })
          .eq('id', id);
      }
    }
  }
}
