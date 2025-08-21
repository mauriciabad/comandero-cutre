'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/user-store';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, signup } = useAuthStore();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'waiter' | 'cook' | 'barman'>('waiter');
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const success = await login(loginEmail, loginPassword);

      if (success) {
        toast.success('Inicio de sesión exitoso');
        router.push('/orders');
      } else {
        toast.error('Email o contraseña inválidos');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ocurrió un error durante el inicio de sesión');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupLoading(true);

    try {
      const success = await signup(signupEmail, signupPassword, name, role);

      if (success) {
        toast.success('Cuenta creada exitosamente');
        router.push('/orders');
      } else {
        toast.error('Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Ocurrió un error durante el registro');
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              placeholder="tu.email@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              placeholder="Introduce tu contraseña"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoginLoading}>
            {isLoginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <div className="mb-6 text-center text-red-500 text-sm">
          El registro está deshabilitado por ahora.
        </div>
        <form onSubmit={handleSignupSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              placeholder="tu.email@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Contraseña</Label>
            <Input
              id="signup-password"
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              placeholder="Elige una contraseña"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tu Nombre</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Introduce tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tu Rol</Label>
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'waiter' | 'cook' | 'barman')
              }
              required
              className="w-full p-2 border rounded"
            >
              <option value="waiter">Camarero</option>
              <option value="cook">Cocinero</option>
              <option value="barman">Barman</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isSignupLoading}>
            {isSignupLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};
