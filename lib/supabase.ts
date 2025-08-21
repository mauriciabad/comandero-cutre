import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create the Supabase client with the environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: 'waiter' | 'cook' | 'barman';
          preferences: {
            notificationsEnabled: boolean;
          } | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: 'waiter' | 'cook' | 'barman';
          preferences?: {
            notificationsEnabled: boolean;
          } | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'waiter' | 'cook' | 'barman';
          preferences?: {
            notificationsEnabled: boolean;
          } | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          type: 'food' | 'drink' | null;
          color: string | null;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          type?: 'food' | 'drink' | null;
          color?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          type?: 'food' | 'drink' | null;
          color?: string | null;
          emoji?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table_number: string;
          created_by: string;
          items: {
            product: {
              id: string;
              name: string;
              price: number;
              type?: 'food' | 'drink';
              color?: string;
              emoji?: string;
            };
            amount: number;
            notes?: string;
          }[];
          cancelled_at: string | null;
          paid_at: string | null;
          drinks_ready_at: string | null;
          food_ready_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_number: string;
          created_by: string;
          items: {
            product: {
              id: string;
              name: string;
              price: number;
              type?: 'food' | 'drink';
              color?: string;
              emoji?: string;
            };
            amount: number;
            notes?: string;
          }[];
          cancelled_at?: string | null;
          paid_at?: string | null;
          drinks_ready_at?: string | null;
          food_ready_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_number?: string;
          created_by?: string;
          items?: {
            product: {
              id: string;
              name: string;
              price: number;
              type?: 'food' | 'drink';
              color?: string;
              emoji?: string;
            };
            amount: number;
            notes?: string;
          }[];
          cancelled_at?: string | null;
          paid_at?: string | null;
          drinks_ready_at?: string | null;
          food_ready_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
