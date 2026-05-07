import { useState } from 'react';
import { useAuth } from '../contexts/authContext';

function Navbar() {
  // Estado para controlar o menu mobile (opcional, mas bom para aprender)
  const [isOpen, setIsOpen] = useState(false);
  const { isLogged, setIsLogged } = useAuth();

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo / Nome do Site */}
          <div className="flex items-center">
            <a href="#" className="text-xl font-bold text-blue-400">
              Criador de Apostilas
            </a>
          </div>

          {/* 2. Links de Navegação (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Início
              </a>
              {isLogged ? (
                <a href="" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Olá, {localStorage.getItem('user_name')}!
                </a>
              ) : (
                <a href="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Fazer Login
                </a>
              )}

            </div>
          </div>


        </div>
      </div>
    </nav>
  );
}

export default Navbar;