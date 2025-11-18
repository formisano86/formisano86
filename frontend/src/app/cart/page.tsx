'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cartApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/utils/format';
import { Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, total, setCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await cartApi.get();
        setCart(data.items, data.total, data.itemCount);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, setCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await cartApi.updateItem(itemId, { quantity: newQuantity });
      updateQuantity(itemId, newQuantity);
      const { data } = await cartApi.get();
      setCart(data.items, data.total, data.itemCount);
      toast.success('Quantità aggiornata');
    } catch (error) {
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId);
      removeItem(itemId);
      const { data } = await cartApi.get();
      setCart(data.items, data.total, data.itemCount);
      toast.success('Prodotto rimosso dal carrello');
    } catch (error) {
      toast.error('Errore nella rimozione');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Carrello</h1>
        <p className="text-gray-600 mb-8">
          Devi effettuare il login per visualizzare il carrello
        </p>
        <Link
          href="/login"
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Effettua il login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Carrello Vuoto</h1>
        <p className="text-gray-600 mb-8">
          Il tuo carrello è vuoto. Inizia a fare shopping!
        </p>
        <Link
          href="/products"
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Continua lo shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Carrello</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item) => {
              const primaryImage =
                item.product.images.find((img: any) => img.isPrimary) ||
                item.product.images[0];
              const price = item.product.salePrice || item.product.price;

              return (
                <div
                  key={item.id}
                  className="flex items-center p-6 border-b last:border-b-0"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {primaryImage && (
                      <Image
                        src={primaryImage.url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow ml-6">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-lg font-semibold hover:text-primary-600"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {formatCurrency(price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center mt-4 space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 size={18} className="mr-1" />
                        Rimuovi
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right ml-6">
                    <p className="text-xl font-bold">
                      {formatCurrency(price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Riepilogo Ordine</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotale</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spedizione</span>
                <span className="font-semibold">{formatCurrency(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (22%)</span>
                <span className="font-semibold">
                  {formatCurrency(total * 0.22)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-bold">Totale</span>
                  <span className="font-bold text-primary-600">
                    {formatCurrency(total + 5 + total * 0.22)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Procedi al Checkout
            </button>

            <Link
              href="/products"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4"
            >
              Continua lo shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
