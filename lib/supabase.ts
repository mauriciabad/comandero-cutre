import { createClient } from '@supabase/supabase-js';

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error('Missing Supabase credentials environment variables');
}

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
          tableNumber: string;
          createdBy: string;
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
          cancelledAt: string | null;
          paidAt: string | null;
          drinksReadyAt: string | null;
          foodReadyAt: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          tableNumber: string;
          createdBy: string;
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
          cancelledAt?: string | null;
          paidAt?: string | null;
          drinksReadyAt?: string | null;
          foodReadyAt?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          tableNumber?: string;
          createdBy?: string;
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
          cancelledAt?: string | null;
          paidAt?: string | null;
          drinksReadyAt?: string | null;
          foodReadyAt?: string | null;
          createdAt?: string;
        };
      };
    };
  };
};
