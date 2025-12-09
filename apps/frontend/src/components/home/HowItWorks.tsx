import { Search, Calendar, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Busque e Escolha',
    description: 'Navegue por milhares de produtos e encontre o perfeito para seu evento.',
  },
  {
    icon: Calendar,
    title: 'Solicite e Aguarde',
    description: 'Faça sua solicitação e aguarde a aprovação do vendedor.',
  },
  {
    icon: CreditCard,
    title: 'Pague com Segurança',
    description: 'Após aprovação, efetue o pagamento via Stripe de forma segura.',
  },
  {
    icon: Package,
    title: 'Receba e Aproveite',
    description: 'Receba os itens na data combinada e realize seu evento dos sonhos.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
