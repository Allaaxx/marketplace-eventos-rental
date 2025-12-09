import Link from 'next/link';
import { Search } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Torne Seu Evento Inesquecível
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Alugue decoração e itens para festas, casamentos e eventos
            especiais
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar produtos, categorias..."
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Ver Produtos
            </Link>
            <Link
              href="/how-it-works"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
            >
              Como Funciona
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
