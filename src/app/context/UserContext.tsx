'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  loginSei: string;
  email: string;
  phone: string;
  pg: string;
  tipo: string;
  omeId: number;
  mat: number;
  nomeGuerra: string;
  funcao: string;
  typeUser: number;
  iat: number;
  exp: number;
  ome?: {
    id: number;
    nomeOme: string;
    diretoriaId: number;
    diretoria?: {
      id: number;
      nomeDiretoria: string;
      dpo?: {
        id: number;
        nomeDpo: string;
      };
    };
  };
}



const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const rawCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))?.split('=')[1];

    if (rawCookie) {
      try {
        const decoded = atob(decodeURIComponent(rawCookie));
        const parsedUser = JSON.parse(decoded);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear o cookie:', error);
      }
    }
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
