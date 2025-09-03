import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if email is from VU domain
export const isVuEmail = (email: string): boolean => {
  return email.endsWith('@vu.edu.pk');
};

// Custom error for non-VU emails
export class NonVuEmailError extends Error {
  constructor() {
    super('Only VU email addresses are allowed.');
    this.name = 'NonVuEmailError';
  }
}