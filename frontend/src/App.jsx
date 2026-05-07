import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import { useState } from 'react';
import { AuthProvider } from './contexts/authContext';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;