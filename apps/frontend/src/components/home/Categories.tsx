import { Cake, Heart, Sparkles, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const categories = [
  { name: 'Casamentos', icon: Heart, color: 'text-pink-500' },
  { name: 'Aniversários', icon: Cake, color: 'text-purple-500' },
  { name: 'Festas Temáticas', icon: Sparkles, color: 'text-blue-500' },
  { name: 'Eventos Corporativos', icon: Gift, color: 'text-green-500' },
];

export function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Categorias Populares</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.name} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <category.icon className={`h-12 w-12 mx-auto mb-4 ${category.color}`} />
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
