'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const statusLabels: Record<string, string> = {
  PENDING_VENDOR_REVIEW: 'Aguardando Aprovação',
  APPROVED_AWAITING_PAYMENT: 'Aprovado - Pagar',
  PAID_CONFIRMED: 'Pago e Confirmado',
  ACTIVE: 'Ativo',
  RETURNED: 'Devolvido',
  COMPLETED: 'Finalizado',
  REJECTED_BY_VENDOR: 'Rejeitado',
  CANCELLED_BY_CUSTOMER: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDING_VENDOR_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED_AWAITING_PAYMENT: 'bg-blue-100 text-blue-800',
  PAID_CONFIRMED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-purple-100 text-purple-800',
  RETURNED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED_BY_VENDOR: 'bg-red-100 text-red-800',
  CANCELLED_BY_CUSTOMER: 'bg-gray-100 text-gray-800',
};

export default function BookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get<{ bookings: Booking[] }>('/bookings');
      return response.data.bookings;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>

      {bookings?.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">Você ainda não tem reservas</p>
          <Button onClick={() => window.location.href = '/products'}>
            Explorar Produtos
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings?.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Reserva #{booking.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startDate).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(booking.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    R$ {booking.totalAmount.toFixed(2)}
                  </p>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>
                </div>
              </div>

              {booking.items && booking.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Itens:</h4>
                  <ul className="space-y-1">
                    {booking.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600">
                        {item.quantity}x - R$ {item.unitPrice.toFixed(2)} ({item.days} dias)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {booking.status === 'APPROVED_AWAITING_PAYMENT' && (
                <div className="mt-4">
                  <Button className="w-full">
                    Pagar Agora
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
