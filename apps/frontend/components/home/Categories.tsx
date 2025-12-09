'use client';

import Link from 'next/link';
import { Cake, Heart, Baby, Gift, Sparkles, Calendar } from 'lucide-react';

const categories = [
  { name: 'Casamentos', icon: Heart, slug: 'casamentos', color: 'bg-pink-500' },
  { name: 'Aniversários', icon: Cake, slug: 'aniversarios', color: 'bg-purple-500' },
  { name: 'Chá de Bebê', icon: Baby, slug: 'cha-de-bebe', color: 'bg-blue-500' },
  { name: 'Formaturas', icon: Gift, slug: 'formaturas', color: 'bg-yellow-500' },
  { name: 'Festas Temáticas', icon: Sparkles, slug: 'festas-tematicas', color: 'bg-green-500' },
  { name: 'Eventos Corporativos', icon: Calendar, slug: 'eventos-corporativos', color: 'bg-indigo-500' },
];

export function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Categorias Populares
          </h2>
          <p className="text-gray-600 text-lg">
            Encontre tudo o que precisa para o seu evento
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div
                  className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
