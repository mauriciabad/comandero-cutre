import { LoginForm } from '@/components/login-form';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Comandero App</h1>
        <p className="text-center text-gray-600">
          Enter your password to continue
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
