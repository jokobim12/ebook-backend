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
      // Support multi-category: category field is comma-separated
      // Filter ebooks that contain the selected category
      query = query.ilike('category', `%${category}%`);
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

  // Bookmarks
  async getBookmarks(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('bookmarks')
      .select('ebook_id, ebooks(*, users!author_id(name), ebook_pages(id, chapter, order))')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((b: any) => ({
      ...b.ebooks,
      author_name: b.ebooks?.users?.name || 'Anonim',
    })).filter(b => b.id);
  }

  async addBookmark(userId: string, ebookId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('bookmarks')
      .insert({ user_id: userId, ebook_id: ebookId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removeBookmark(userId: string, ebookId: string) {
    const { error } = await this.supabase.getClient()
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('ebook_id', ebookId);
    if (error) throw error;
    return { success: true };
  }

  // Reading History
  async getReadingHistory(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('reading_history')
      .select('current_page, total_pages, updated_at, ebooks(*, users!author_id(name))')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((h: any) => ({
      ebook_id: h.ebooks?.id,
      book: {
        ...h.ebooks,
        author_name: h.ebooks?.users?.name || 'Anonim',
      },
      progress: {
        page: h.current_page,
        totalPages: h.total_pages,
        updatedAt: h.updated_at,
      }
    })).filter(h => h.book && h.book.id);
  }

  async updateReadingHistory(userId: string, ebookId: string, currentPage: number, totalPages: number) {
    const { data, error } = await this.supabase.getClient()
      .from('reading_history')
      .upsert({
        user_id: userId,
        ebook_id: ebookId,
        current_page: currentPage,
        total_pages: totalPages,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,ebook_id'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
