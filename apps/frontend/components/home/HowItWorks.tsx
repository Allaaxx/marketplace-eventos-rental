import { Search, CheckCircle, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Encontre o que Precisa',
    description: 'Navegue por centenas de produtos e escolha o que melhor combina com seu evento',
  },
  {
    icon: CheckCircle,
    title: 'Solicite a Reserva',
    description: 'Selecione as datas e aguarde a aprovação do vendedor',
  },
  {
    icon: CreditCard,
    title: 'Realize o Pagamento',
    description: 'Após aprovação, efetue o pagamento de forma segura',
  },
  {
    icon: Package,
    title: 'Receba em Casa',
    description: 'Receba os itens no local do evento ou retire na loja',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-gray-600 text-lg">
            Processo simples e seguro em 4 passos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
