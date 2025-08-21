'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/user-store';
import { toast } from 'sonner';

if (!process.env.NEXT_PUBLIC_APP_PASSWORD_UNSAFE) {
  throw new Error(
    'Missing NEXT_PUBLIC_APP_PASSWORD_UNSAFE environment variable'
  );
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<'password' | 'details'>('password');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'waiter' | 'cook' | 'barman'>('waiter');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Validating password:', password);

    // For simplicity in this example, we just validate the password here
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD_UNSAFE) {
      console.log('Password validated successfully');
      toast.success('Password correct');
      setIsLoading(false);
      setStep('details');
    } else {
      console.log('Invalid password');
      toast.error('Invalid password');
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(password, { name, role });

      if (success) {
        toast.success('Login successful');
        router.push('/orders');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'password') {
    return (
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Validating...' : 'Continue'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Your Role</Label>
        <select
          id="role"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as 'waiter' | 'cook' | 'barman')
          }
          required
          className="w-full p-2 border rounded"
        >
          <option value="waiter">Waiter</option>
          <option value="cook">Cook</option>
          <option value="barman">Barman</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Start Working'}
      </Button>
    </form>
  );
};
