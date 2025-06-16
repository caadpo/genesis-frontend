'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../privateLayout.module.css';
import { FaHome, FaUser, FaCog, FaSignOutAlt, FaBars, FaEllipsisV, FaKey } from 'react-icons/fa';
import Image from 'next/image';


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
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {

    if (showUserModal) {
      setActiveTab('geral');
    }
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
    setIsLoading(false);

    function handleClickOutside(event: MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setHeaderMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserModal]);

  if (isLoading) return <div>Carregando...</div>;
  if (!user) return <div>Você não está autenticado.</div>;

  return (
    <div className={styles.appContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/assets/images/logo.png" alt="logo" width={28} height={28} />
          <span className={styles.logoText}>Genesis</span>
        </div>

        <div className={styles.headerMenu} ref={headerMenuRef}>
          <button
            className={styles.headerMenuButton}
            onClick={() => setHeaderMenuOpen(prev => !prev)}
          >
            <FaEllipsisV />
          </button>
          {headerMenuOpen && (
            <div className={styles.headerDropdown}>
              <div onClick={() => {
                document.cookie = 'accessToken=; Max-Age=0; path=/';
                document.cookie = 'userData=; Max-Age=0; path=/';
                window.location.href = '/login';
              }}>
                <FaSignOutAlt style={{ marginRight: '8px' }} />
                Sair
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <div className={styles.dashboardContainer}>
        {/* Sidebar */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <ul className={styles.menuItems}>
            <li className={pathname === '/dashboard' ? styles.active : ''}>
              <FaHome className={styles.icon} />
              {sidebarOpen && <span className={styles.itemText}>Dashboard</span>}
            </li>
            <li className={pathname === '/perfil' ? styles.active : ''}>
              <FaUser className={styles.icon} />
              {sidebarOpen && <span className={styles.itemText}>Perfil</span>}
            </li>
            <li className={pathname === '/configuracoes' ? styles.active : ''}>
              <FaCog className={styles.icon} />
              {sidebarOpen && <span className={styles.itemText}>Configurações</span>}
            </li>
            <li>
              <FaSignOutAlt className={styles.icon} />
              {sidebarOpen && <span className={styles.itemText}>Sair</span>}
            </li>
          </ul>

          {/* Rodapé com ícone do usuário */}
          <div className={styles.sidebarFooter}>
            <div
              className={styles.profileItem}
              onClick={() => setShowUserModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <FaUser className={styles.icon} />
              {sidebarOpen && <span className={styles.itemText}>Perfil</span>}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <main className={styles.conteudoPagina}>
          <h1>Dashboard</h1>
          <p><strong>Bem-vindo:</strong> {user.nomeGuerra} ({user.funcao})</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefone:</strong> {user.phone}</p>
          <p><strong>Matrícula:</strong> {user.mat}</p>
          <p><strong>Posto/Graduação:</strong> {user.pg}</p>
          <p><strong>Tipo de Usuário:</strong> {user.typeUser}</p>
          {user.ome && (
            <p><strong>OME:</strong> {user.ome.nomeOme} (ID: {user.ome.id})</p>
          )}
        </main>
      </div>

      {/* Modal com dados do usuário */}
      {showUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.userModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalLeft}>
              <ul className={styles.modalMenu}>
                <li
                  className={activeTab === 'geral' ? styles.activeMenuItem : ''}
                  onClick={() => setActiveTab('geral')}
                >
                  <span className={styles.menuIcon}>📋</span>
                  <span>Geral</span>
                </li>
                <li
                  className={activeTab === 'senha' ? styles.activeMenuItem : ''}
                  onClick={() => setActiveTab('senha')}
                >
                  <FaKey className={styles.menuIcon} />
                  <span>Trocar Senha</span>
                </li>
              </ul>

              <div className={styles.modalFooterLeft}>
                <div
                  className={styles.profileFooterItem}
                  onClick={() => setShowUserModal(false)}
                >
                  <FaUser className={styles.menuIcon} />
                  <span>Perfil</span>
                </div>
              </div>
            </div>

            <div className={styles.modalRight}>
              {activeTab === 'geral' && (
                <>
                  <h2>Dados do Usuário</h2>
                  <p><strong>Nome:</strong> {user.nomeGuerra}</p>
                  <p><strong>Função:</strong> {user.funcao}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Telefone:</strong> {user.phone}</p>
                  <p><strong>Matrícula:</strong> {user.mat}</p>
                  <p><strong>Posto/Graduação:</strong> {user.pg}</p>
                  <p><strong>Tipo de Usuário:</strong> {user.typeUser}</p>
                  {user.ome && (
                    <p><strong>OME:</strong> {user.ome.nomeOme} (ID: {user.ome.id})</p>
                  )}
                </>
              )}
              {activeTab === 'senha' && (
                <>
                  <h2>Trocar Senha</h2>
                  <p>Funcionalidade de troca de senha aqui...</p>
                </>
              )}
              {activeTab === 'perfil' && (
                <>
                  
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
