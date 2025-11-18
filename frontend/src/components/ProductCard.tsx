import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { cartApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 });
      const { data } = await cartApi.get();
      setCart(data.items, data.total, data.itemCount);
      toast.success('Prodotto aggiunto al carrello');
    } catch (error) {
      toast.error('Errore durante l\'aggiunta al carrello');
    }
  };

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        {/* Image */}
        <div className="relative h-64 bg-gray-200">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              SCONTO
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              IN EVIDENZA
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
          </div>

          {/* Stock indicator */}
          {product.inventory && (
            <div className="mt-3">
              {product.inventory.quantity > 0 ? (
                <span className="text-xs text-green-600">
                  {product.inventory.quantity <= product.inventory.lowStockThreshold
                    ? `Solo ${product.inventory.quantity} disponibili`
                    : 'Disponibile'}
                </span>
              ) : (
                <span className="text-xs text-red-600">Non disponibile</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
