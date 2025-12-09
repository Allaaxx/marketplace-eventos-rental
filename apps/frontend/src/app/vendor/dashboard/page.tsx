'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['vendor-bookings'],
    queryFn: async () => {
      const response = await api.get<{ bookings: Booking[] }>('/bookings');
      return response.data.bookings;
    },
  });

  const pendingBookings = bookings?.filter(b => b.status === 'PENDING_VENDOR_REVIEW') || [];
  const activeBookings = bookings?.filter(b => b.status === 'ACTIVE' || b.status === 'PAID_CONFIRMED') || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Vendedor</h1>
        <Link href="/vendor/products/new">
          <Button>
            <Package className="h-5 w-5 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pendentes</p>
              <p className="text-3xl font-bold">{pendingBookings.length}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ativos</p>
              <p className="text-3xl font-bold">{activeBookings.length}</p>
            </div>
            <ShoppingBag className="h-12 w-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Faturamento</p>
              <p className="text-3xl font-bold">R$ 0</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Produtos</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Package className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Reservas Pendentes</h2>
          {isLoading ? (
            <p>Carregando...</p>
          ) : pendingBookings.length === 0 ? (
            <p className="text-gray-500">Nenhuma reserva pendente</p>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Reserva #{booking.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-primary-600">
                      R$ {booking.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary">
                      Aprovar
                    </Button>
                    <Button size="sm" variant="outline">
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Reservas Ativas</h2>
          {isLoading ? (
            <p>Carregando...</p>
          ) : activeBookings.length === 0 ? (
            <p className="text-gray-500">Nenhuma reserva ativa</p>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Reserva #{booking.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {booking.status}
                      </span>
                    </div>
                    <p className="font-bold text-primary-600">
                      R$ {booking.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
