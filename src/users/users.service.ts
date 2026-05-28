import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface User {
  id?: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'creator' | 'admin';
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('id, name, email, role, bio, avatar_url, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  }

  async create(user: Partial<User>) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<User>) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase.getClient()
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
