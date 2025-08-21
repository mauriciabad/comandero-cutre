import { create } from 'zustand';
import { persist } from 'zustand/middleware';

if (!process.env.NEXT_PUBLIC_APP_PASSWORD_UNSAFE) {
  throw new Error(
    'Missing NEXT_PUBLIC_APP_PASSWORD_UNSAFE environment variable'
  );
}

type User = {
  name: string;
  role: 'waiter' | 'cook' | 'barman';
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (password: string, user: User) => Promise<boolean>;
  logout: () => void;
};

// In a real app, you would verify this against a server
const validatePassword = (password: string) => {
  const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD_UNSAFE;
  return password === appPassword;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (password: string, user: User) => {
        // In a production app, this would be a proper API call
        if (validatePassword(password)) {
          set({ isAuthenticated: true, user });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'comandero-auth',
    }
  )
);
