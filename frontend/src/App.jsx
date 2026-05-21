import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import { useState } from 'react';
import { AuthProvider } from './contexts/authContext';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  // Lista de rotas que NÃO devem ter a Sidebar
  const rotasSemSidebar = ['/login', '/registro', '/recuperar-senha'];
  const rotasComNavbar = ['/login']

  // Verifica se a rota atual está na lista
  // includes retorna true se encontrar, então invertemos com !
  const mostrarSidebar = !rotasSemSidebar.includes(location.pathname);
  const mostrarNavbar = rotasComNavbar.includes(location.pathname);
  return (
    <AuthProvider>
      <BrowserRouter>
        {mostrarNavbar && <Navbar />}
        {mostrarSidebar && <Sidebar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;