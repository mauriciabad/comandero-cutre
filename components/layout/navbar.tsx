'use client';

import { useAuthStore } from '@/lib/store/user-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'waiter':
        return 'bg-blue-500';
      case 'cook':
        return 'bg-orange-500';
      case 'barman':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'waiter':
        return 'Camarero';
      case 'cook':
        return 'Cocinero';
      case 'barman':
        return 'Barman';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/orders" className="text-xl font-bold">
              Comandero
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/orders/new"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Pedido
              </div>
            </Link>
          </nav>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge className={getRoleBadgeColor(user.role)}>
              {getRoleDisplayName(user.role)}
            </Badge>
            {/* <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div> */}
            <Button
              variant="outline"
              aria-label="Cerrar sesión"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/orders"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Tablero de pedidos
              </div>
            </Link>
            <Link
              href="/orders/new"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Pedido
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-base font-medium">{user.name}</div>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </div>
            <div className="mt-3 px-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
