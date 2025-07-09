"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./privateLayout.module.css";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaEllipsisV,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaIdBadge,
  FaSitemap,
  FaUsers,
  FaCalendar,
} from "react-icons/fa";
import Image from "next/image";
import { UserProvider } from "../context/UserContext";

interface User {
  id: number;
  imagemUrl: string;
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

export default function TemplateLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [mesesPorAno, setMesesPorAno] = useState<{ [ano: string]: string[] }>(
    {}
  );
  const [anosAbertos, setAnosAbertos] = useState<{ [ano: string]: boolean }>(
    {}
  );

  const [showMesesModal, setShowMesesModal] = useState(false);
  const [showMesesModalNovo, setShowMesesModalNovo] = useState(false);

  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const mesesModalRef = useRef<HTMLDivElement | null>(null); //fechar a modal ao clicar fora

  const [activeTab, setActiveTab] = useState("perfil");

  const fetchMesesData = async () => {
    try {
      const response = await fetch("/api/pjesteto");
      const data = await response.json();

      const anoAtual = new Date().getFullYear();

      // Filtrar apenas os dados do codVerba 247 e até o ano atual
      const filtrados = data.filter(
        (item: any) => item.codVerba === 247 && item.ano <= anoAtual
      );

      // Array manual com nomes dos meses
      const nomesMeses = [
        "JAN",
        "FEV",
        "MAR",
        "ABR",
        "MAI",
        "JUN",
        "JUL",
        "AGO",
        "SET",
        "OUT",
        "NOV",
        "DEZ",
      ];

      // Agrupar por ano com nomes dos meses sem ponto
      const agrupados: { [ano: string]: string[] } = {};

      filtrados.forEach((item: any) => {
        const mesNome = nomesMeses[item.mes - 1]; // converte número para nome

        if (!agrupados[item.ano]) agrupados[item.ano] = [];

        if (!agrupados[item.ano].includes(mesNome)) {
          agrupados[item.ano].push(mesNome);
        }
      });

      // Ordenar meses pela ordem correta
      Object.keys(agrupados).forEach((ano) => {
        agrupados[ano].sort(
          (a, b) => nomesMeses.indexOf(a) - nomesMeses.indexOf(b)
        );
      });

      setMesesPorAno(agrupados);
      //setShowMesesModal(true);
      setShowMesesModalNovo(true);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const toggleAno = (ano: string) => {
    setAnosAbertos((prev) => ({
      ...prev,
      [ano]: !prev[ano],
    }));
  };

  const router = useRouter();
  const handleMesClick = (ano: string, mes: string) => {
    //setShowMesesModal(false);
    setShowMesesModalNovo(false);
    router.push(`/pjes?ano=${ano}&mes=${mes}`);
  };

  function decodeUserData(base64Str: string) {
    return JSON.parse(decodeURIComponent(escape(atob(base64Str))));
  }

  useEffect(() => {
    if (showUserModal) setActiveTab("geral");

    const rawCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userData="))
      ?.split("=")[1];

    if (rawCookie) {
      try {
        const parsedUser = decodeUserData(rawCookie);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao decodificar userData:", error);
      }
    }
    setIsLoading(false);

    const handleClickOutside = (event: MouseEvent) => {
      // Fecha o menu do header
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target as Node)
      ) {
        setHeaderMenuOpen(false);
      }

      // Fecha a nova modal se clicar fora
      if (
        showMesesModalNovo &&
        mesesModalRef.current &&
        !mesesModalRef.current.contains(event.target as Node)
      ) {
        setShowMesesModalNovo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserModal, showMesesModalNovo]);

  //METODO PARA DESLOGAR
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        setUser(null); // limpa o usuário do estado local
        setShowUserModal(false); // fecha o modal
        // redireciona para página de login (ou onde preferir)
        router.push("/login");
      } else {
        console.error("Erro ao deslogar");
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  }

  if (!user) return <div>Você não está autenticado.</div>;

  if (isLoading) return <div>Carregando...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <UserProvider>
      <div className={styles.appContainer}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image
              src="/assets/images/logo_dpo.png"
              alt="logo"
              width={28}
              height={28}
            />
            <span className={styles.logoText}>Genesis</span>
          </div>
          <div className={styles.headerMenu} ref={headerMenuRef}>
            <button
              className={styles.headerMenuButton}
              onClick={() => setShowUserModal(true)}
            >
              <FaEllipsisV />
            </button>
          </div>
        </header>

        {/* Sidebar + Conteúdo */}
        <div className={styles.dashboardContainer}>
          <div
            className={`${styles.sidebar} ${
              sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
            }`}
          >
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <ul className={styles.menuItems}>
              <li
                className={pathname === "/dashboard" ? styles.active : ""}
                onClick={() => router.push("/dashboard")}
                style={{ cursor: "pointer" }}
              >
                <FaHome style={{ fontSize: "25px" }} className={styles.icon} />
                {sidebarOpen && (
                  <span className={styles.itemText}>Dashboard</span>
                )}
              </li>

              <li
                className={pathname === "/configuracoes" ? styles.active : ""}
              >
                <FaUsers style={{ fontSize: "30px" }} className={styles.icon} />
                {sidebarOpen && (
                  <span className={styles.itemText}>Usuarios</span>
                )}
              </li>

              <li
                onClick={() => {
                  fetchMesesData(); // se necessário
                  setShowMesesModalNovo(true); // abre a nova modal
                }}
                className={pathname === "/pjes" ? styles.active : ""}
              >
                <FaCalendar
                  style={{ fontSize: "25px" }}
                  className={styles.icon}
                />
                {sidebarOpen && <span className={styles.itemText}>PJES</span>}
              </li>
            </ul>

            <div className={styles.sidebarFooter}>
              <div
                className={styles.profileItem}
                onClick={() => setShowUserModal(true)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  width={25}
                  height={25}
                  src={user.imagemUrl || "/assets/images/user_padrao.png"}
                  alt="img_usuario"
                  className={styles.iconUser}
                />
                {sidebarOpen && <span className={styles.itemText}>Perfil</span>}
              </div>
            </div>
          </div>

          <main className={styles.conteudoPagina}>{children}</main>
        </div>

        {/* INICIO MODAL PERFIL DO USUARIO */}
        {showUserModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowUserModal(false)}
          >
            <div
              className={styles.userModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalLeft}>
                <ul className={styles.modalMenu}>
                  <li
                    className={
                      activeTab === "geral" ? styles.activeMenuItem : ""
                    }
                    onClick={() => setActiveTab("geral")}
                  >
                    <span className={styles.menuIcon}>📋</span>
                    <span
                      style={{
                        fontSize: "15px",
                        textAlign: "left",
                        marginLeft: "1px",
                      }}
                    >
                      GERAL
                    </span>
                  </li>
                  <li
                    className={
                      activeTab === "senha" ? styles.activeMenuItem : ""
                    }
                    onClick={() => setActiveTab("senha")}
                  >
                    <FaKey className={styles.menuIcon} />
                    <span
                      style={{
                        fontSize: "15px",
                        textAlign: "left",
                        marginLeft: "5px",
                      }}
                    >
                      SENHA
                    </span>
                  </li>
                  <li
                    className={
                      activeTab === "meuspjes" ? styles.activeMenuItem : ""
                    }
                    onClick={() => setActiveTab("meuspjes")}
                  >
                    <FaSitemap className={styles.menuIcon} />
                    <span
                      style={{
                        fontSize: "15px",
                        textAlign: "left",
                        marginLeft: "5px",
                      }}
                    >
                      PJES
                    </span>
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
                {activeTab === "geral" && user && (
                  <div style={{ textAlign: "center" }}>
                    {/* Imagem do usuário */}
                    <div style={{ marginBottom: "1rem" }}>
                      <Image
                        width={50}
                        height={50}
                        src={user.imagemUrl || "/assets/images/user_padrao.png"}
                        alt="img_usuario"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          color: "#dad7d7",
                          objectFit: "cover",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>

                    {/* Nome, matrícula e função */}
                    <div
                      style={{
                        marginBottom: "1rem",
                        fontSize: "16px",
                        textAlign: "left",
                      }}
                    >
                      <p>
                        {user.pg} {user.nomeGuerra} {user.ome?.nomeOme} |{" "}
                        {user.ome?.diretoria?.nomeDiretoria}
                      </p>
                    </div>

                    {/* Restante dos dados */}
                    <div
                      style={{
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FaUserTag style={{ marginRight: "8px" }} />
                        <span>{user.loginSei}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FaIdBadge style={{ marginRight: "8px" }} />
                        <span>{user.funcao}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FaPhone style={{ marginRight: "8px" }} />
                        <span>{user.phone}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FaEnvelope style={{ marginRight: "8px" }} />
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {/* Linha divisória */}
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px solid #ccc",
                        marginTop: "2rem",
                      }}
                    />

                    <div className={styles.modalFooterLeft}>
                      <div
                        style={{ backgroundColor: "#2e53b1", color: "#ffffff" }}
                        className={styles.profileFooterItem}
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className={styles.menuIcon} />
                        <span>Desconectar</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "senha" && (
                  <>
                    <h2>Trocar Senha</h2>
                    <p>Funcionalidade de troca de senha aqui...</p>
                  </>
                )}
                {activeTab === "meuspjes" && (
                  <>
                    <h2>Meus Pjes</h2>
                    <p>Funcionalidade de pjes aqui...</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* FIM MODAL PERFIL DO USUARIO */}

        {showMesesModalNovo && (
          <div className={styles.modalOverlay}>
            <div
              className={styles.userModal}
              ref={mesesModalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalLeft}>
                <ul className={styles.modalMenu}>
                  {Object.keys(mesesPorAno)
                    .sort((a, b) => Number(b) - Number(a))
                    .map((ano) => (
                      <li
                        key={ano}
                        className={`${styles.botaoVerde} ${
                          activeTab === ano ? styles.activeBotaoVerde : ""
                        }`}
                        onClick={() => setActiveTab(ano)}
                      >
                        <FaCalendar className={styles.menuIcon} />
                        <span style={{ fontSize: "15px", marginLeft: "5px" }}>
                          {ano}
                        </span>
                      </li>
                    ))}
                </ul>

                <div className={styles.modalFooterLeft}>
                  <div
                    className={styles.profileFooterItem}
                    onClick={() => setShowUserModal(false)}
                  >
                    <FaCalendar className={styles.menuIcon} />
                  </div>
                </div>
              </div>
              <div className={styles.modalRight}>
                {mesesPorAno[activeTab] && (
                  <div
                    style={{
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {mesesPorAno[activeTab].map((mes, idx) => (
                      <div
                        key={idx}
                        className={styles.botaoVerde}
                        onClick={() => handleMesClick(activeTab, mes)}
                      >
                        <FaCalendar style={{ marginRight: "8px" }} />
                        <span>{mes}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserProvider>
  );
}
