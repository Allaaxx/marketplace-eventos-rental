import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Marketplace Eventos</h3>
            <p className="text-sm">
              Alugue decorações e itens para seus eventos especiais.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-white">
                  Lojas
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Para Vendedores</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vendor/register" className="hover:text-white">
                  Criar Loja
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 Marketplace Eventos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
