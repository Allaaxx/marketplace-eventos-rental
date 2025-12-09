import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Card } from '@/components/ui/Card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.type === 'rental' && product.dailyRate
    ? `R$ ${parseFloat(product.dailyRate).toFixed(2)}/dia`
    : `R$ ${parseFloat(product.price).toFixed(2)}`;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
          {product.type === 'rental' && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Locação
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">{price}</span>
            {product.category && (
              <span className="text-xs text-gray-500">{product.category}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
