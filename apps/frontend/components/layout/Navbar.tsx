'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎉</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Marketplace Eventos
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Produtos
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Categorias
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Como Funciona
            </Link>
            <Link
              href="/become-vendor"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Seja Vendedor
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <Link
              href="/cart"
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Produtos
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Categorias
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Como Funciona
              </Link>
              <Link
                href="/become-vendor"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Seja Vendedor
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
