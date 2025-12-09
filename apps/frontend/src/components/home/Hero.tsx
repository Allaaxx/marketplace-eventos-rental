import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">
            Transforme Seu Evento em Uma Celebração Inesquecível
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Alugue decorações incríveis para casamentos, aniversários e festas temáticas.
            Fácil, rápido e seguro.
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Explorar Produtos
              </Button>
            </Link>
            <Link href="/vendor/register">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Seja um Vendedor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
