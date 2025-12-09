'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Marketplace Eventos
          </Link>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos, lojas..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost">Produtos</Button>
            </Link>
            <Link href="/shops">
              <Button variant="ghost">Lojas</Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">
                <User className="h-5 w-5 mr-2" />
                Entrar
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
