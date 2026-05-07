import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLogged, setIsLogged } = useAuth();

  return (
    <div className="flex">
      {/* 
        A Sidebar 
        - transition-all: Suaviza a abertura/fechamento
        - w-64: Largura aberta (16rem)
        - w-20: Largura fechada (5rem) - opcional, aqui vamos usar ocultar
      */}
      <aside 
        className={`
          ${isOpen ? 'w-64' : 'w-0'} 
          lg:w-64 // Em telas grandes (lg), sempre mostra
          h-screen 
          bg-gray-900 
          text-white 
          flex flex-col 
          transition-all 
          duration-300 
          overflow-hidden 
          relative
          shadow-xl
        `}
      >
        {/* Cabeçalho da Sidebar (Botão Novo Chat, etc) */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          {isOpen && <h1 className="text-xl font-bold">Minha IA</h1>}
          
          {/* Botão de fechar/abrir (visível só em mobile ou se quiser recolher) */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-lg hover:bg-gray-700 lg:hidden"
          >
            {isOpen ? 'X' : '?'}
          </button>
        </div>

        {/* Lista de Conversas / Links */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 mb-4 text-sm">
            <span>+</span>
            {isOpen && <span>Criar Apostila</span>}
          </button>

          <div className="space-y-1">
            {/* Exemplo de item ativo */}
            <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-white">
              <span>??</span>
              {isOpen && <span className="truncate">Portugues</span>}
            </Link>
            
            <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400">
              <span>??</span>
              {isOpen && <span className="truncate">Matematica 3º Ano</span>}
            </Link>
          </div>
        </nav>

        {/* Rodapé (Perfil/Config) */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            {isLogged ? (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                    {localStorage.getItem('user_name') == null ? ('?') : (localStorage.getItem('user_name')[0])}
                </div>
            ) : (
                '?'

            )}

            {isOpen && <span className="text-sm">{localStorage.getItem('user_name') == null ? (
            <a href="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Fazer Login</a>) : (localStorage.getItem('user_name'))}</span>}
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 h-screen bg-gray-800 overflow-y-auto relative">
        
        {/* Botão de Menu para telas pequenas (Hamburguer) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-4 left-4 z-50 p-2 bg-gray-900 rounded-md text-white lg:hidden"
        >
          ?
        </button>

        {/* O conteúdo da sua página entra aqui */}
        <div className="p-8 pt-20 flex flex-col items-center justify-center h-full text-gray-300">
          <h2 className="text-3xl font-semibold mb-4">Pronto pra criar a próxima apostila profissional?</h2>
          <p className="text-center max-w-md text-gray-500">
            Selecione uma projeto de apostila ou crie uma nova!
          </p>
        </div>

      </main>
    </div>
  );
}

export default Sidebar;