import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase';

type User = {
  name: string;
  role: 'waiter' | 'cook' | 'barman';
  id: string;
  email: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: 'waiter' | 'cook' | 'barman'
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error.message);
            return false;
          }

          // Get user profile after successful login
          await get().getUserProfile();
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      signup: async (
        email: string,
        password: string,
        name: string,
        role: 'waiter' | 'cook' | 'barman'
      ) => {
        try {
          // Sign up user in supabase auth
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
            });

          if (authError || !authData.user) {
            console.error('Signup error:', authError?.message);
            return false;
          }

          // Create user profile in users table
          const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            name,
            role,
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            return false;
          }

          // Get user data and set authenticated state
          set({
            isAuthenticated: true,
            user: {
              id: authData.user.id,
              name,
              role,
              email,
            },
          });

          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) console.error('Logout error:', error);
          set({ isAuthenticated: false, user: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      getUserProfile: async () => {
        try {
          // Get current session
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          const userId = sessionData.session.user.id;
          const email = sessionData.session.user.email || '';

          // Get user profile from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, role')
            .eq('id', userId)
            .single();

          if (userError || !userData) {
            console.error('Error fetching user profile:', userError);
            return;
          }

          set({
            isAuthenticated: true,
            user: {
              id: userId,
              email,
              name: userData.name,
              role: userData.role,
            },
          });
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
      },
    }),
    {
      name: 'comandero-auth',
    }
  )
);
