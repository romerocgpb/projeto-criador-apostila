import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faS, faSignOut } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import ListaApostilas from "./ListaApostilas"
import ApostilaManager from "./ApostilaManager"

function handleLogout(){
  localStorage.removeItem('h');
  localStorage.removeItem('user_name');
  window.location.reload()
}


async function createNewChat(){
	let resp = await axios.post('/api/apostilas/new', {}, {headers: {
		authorization: localStorage.getItem('h')}
	})
	console.log(resp)
}

function Sidebar() {
  
	const { isLogged, setIsLogged } = useAuth();
	if (!isLogged) {
		return <Navigate to="/login" replace />;
	}
	const [isOpen, setIsOpen] = useState(true);
	const [chatAtivo, setChatAtivo] = useState("");

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
				{isOpen && <h1 className="text-xl font-bold">Criador de Apostila</h1>}
				
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
				<button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 mb-4 text-sm" onClick={createNewChat}>
					<span>+</span>
					{isOpen && <span>Criar Apostila</span>}
				</button>

				<div className="space-y-1">
					<ListaApostilas isOpen={isOpen} chatAtivo={chatAtivo} setChatAtivo={setChatAtivo} />
				</div>
			</nav>

			{/* Rodapé (Perfil/Config) */}
			<div className="p-4 border-t border-gray-700">
				<div className="flex items-center gap-3">
					<span className="text-sm">
					{!isLogged ? (
						// SE NÃO ESTÁ LOGADO
						<a href="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
						Fazer Login
						</a>
					) : (
						// SE ESTÁ LOGADO
						// IMPORTANTE: Envolva com <>...</> ou <div> para ter dois elementos irmãos
						<>
						{localStorage.getItem('user_name')} 
						{/* Exemplo de botão de sair ou link para perfil */}
						<a href="" onClick={handleLogout} className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium ml-2">
							<FontAwesomeIcon icon={faSignOut}/> Sair
						</a>
						</>
					)}
					</span>
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
				<ApostilaManager chatAtivo={chatAtivo}/>
			</div>

		</main>
		</div>
	);
}

export default Sidebar;