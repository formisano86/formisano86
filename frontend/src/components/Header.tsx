'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            E-Commerce
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cerca prodotti..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-primary-600">
              Prodotti
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600">
              Categorie
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="text-gray-700 hover:text-primary-600" size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <User size={24} />
                  <span>{user?.firstName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Il mio account
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    I miei ordini
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/products" className="text-gray-700 hover:text-primary-600">
                Prodotti
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600">
                Categorie
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="text-gray-700 hover:text-primary-600">
                    Il mio account
                  </Link>
                  <Link href="/orders" className="text-gray-700 hover:text-primary-600">
                    I miei ordini
                  </Link>
                  <button onClick={logout} className="text-left text-gray-700 hover:text-primary-600">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
