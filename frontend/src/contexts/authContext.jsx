import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Verifica se já existe token no localStorage ao carregar
  const [isLogged, setIsLogged] = useState(() => {
    const token = localStorage.getItem('h');
    return !!token; // Retorna true se existir, false se não
  });

  return (
    <AuthContext.Provider value={{ isLogged, setIsLogged }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}