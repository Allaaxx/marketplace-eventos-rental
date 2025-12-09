'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Calendar, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const response = await api.get<{ product: Product }>(`/products/${params.id}`);
      return response.data.product;
    },
  });

  const createBooking = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/bookings', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Solicitação de reserva criada com sucesso!');
      router.push('/bookings');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar reserva');
    },
  });

  const handleBooking = () => {
    if (!startDate || !endDate) {
      toast.error('Selecione as datas de locação');
      return;
    }

    createBooking.mutate({
      shopId: product?.shopId,
      items: [{ productId: product?.id, quantity }],
      startDate,
      endDate,
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Produto não encontrado</div>;
  }

  const price = product.type === 'rental' && product.dailyRate
    ? parseFloat(product.dailyRate)
    : parseFloat(product.price);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
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
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary-600">
              R$ {price.toFixed(2)}
              {product.type === 'rental' && '/dia'}
            </span>
            {product.type === 'rental' && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Locação
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-5 w-5" />
              <span>Quantidade disponível: {product.quantity}</span>
            </div>
          </div>

          {product.type === 'rental' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Data de Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data de Término</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Quantidade:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-4 py-1 border rounded-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={handleBooking}
            className="w-full"
            size="lg"
            disabled={createBooking.isPending}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.type === 'rental' ? 'Solicitar Locação' : 'Comprar Agora'}
          </Button>
        </div>
      </div>
    </div>
  );
}
