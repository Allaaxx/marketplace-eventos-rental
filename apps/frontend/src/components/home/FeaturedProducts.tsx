'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await api.get<{ products: Product[] }>('/products?limit=8');
      return response.data.products;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Produtos em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
