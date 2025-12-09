'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    type: string;
    price: string;
    dailyRate?: string;
    images: string[];
    shopId: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.type === 'rental' && product.dailyRate
    ? parseFloat(product.dailyRate)
    : parseFloat(product.price);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="aspect-square bg-gray-200 relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-16 h-16" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-primary-600">
              {product.type === 'rental' ? 'Locação' : 'Venda'}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(price)}
              </p>
              {product.type === 'rental' && (
                <p className="text-xs text-gray-500">por dia</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
