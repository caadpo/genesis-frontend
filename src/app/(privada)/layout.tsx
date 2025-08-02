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
  FaAlignCenter,
  FaKeycdn,
  FaUniversity,
  FaMapMarkerAlt,
  FaAirbnb,
  FaCheckSquare,
  FaSearch,
  FaInfo,
  FaCheck,
} from "react-icons/fa";
import Image from "next/image";
import { UserProvider } from "../context/UserContext";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import { FaTriangleExclamation } from "react-icons/fa6";

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

interface Escala {
  dia: string;
  nomeOperacao: string;
  nomeOme: string;
  localApresentacaoSgp: string;
  situacaoSgp: string;
  horaInicio: string;
  horaFinal: string;
  funcao: string;
  statusEscala: string;
  anotacaoEscala: string;
  obs: string;
  ttCota: number;
  codOp: string;

  tetoStatusTeto?: string;
  tetoCreatedAtStatusTeto?: string | null;
  tetoStatusPg?: string;
  tetoCreatedAtStatusPg?: string | null;

  ultimoStatusLog?: {
    novoStatus: string;
    dataAlteracao: string;
    pg: string;
    imagemUrl: string;
    nomeGuerra: string;
    nomeOme: string;
  };
}

interface TileProps {
  date: Date;
  view: "month" | "year" | "decade" | "century";
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

  const [showMesesModalNovo, setShowMesesModalNovo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [date, setDate] = useState<Date>(new Date());

  //FORMATANDO A DATA PARA O TIPO BRASILEIRO
  const formatDate = (dateStr: string) => {
    const [ano, mes, dia] = dateStr.split("-");
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
    const nomeMes = nomesMeses[parseInt(mes, 10) - 1];
    return { dia, mes, nomeMes };
  };
  //FORMATANDO A DATA E HORA TIRAR AUTERAÇÃO
  const formatarDataHoraBR = (dataIso: string): string => {
    if (!dataIso) return "";

    const data = new Date(dataIso);

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  };

  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const mesesModalRef = useRef<HTMLDivElement | null>(null);

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

  //INICIO BUSCAR AS ESCALAS PARA RENDERIZER NO CALENDARIO
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [ano, setAno] = useState<string | null>(null);
  const [mes, setMes] = useState<string | null>(null);

  useEffect(() => {
    const fetchMinhasEscalas = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pjesescala/minhas-escalas");
        const data = await res.json();

        if (!res.ok)
          throw new Error(data.error || "Erro ao buscar minhas escalas");

        setEscalas(data);
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMinhasEscalas();
  }, []);

  //FIM BUSCAR AS ESCALAS PARA RENDERIZER NO CALENDARIO

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

  const handleChangePassword = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      console.log("Resposta da API:", res.status, data);

      if (!res.ok) {
        // Exibe a mensagem que vem do backend, ou erro genérico
        alert(data.message || data.error || "Erro ao alterar senha");
      } else {
        alert("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro inesperado ao alterar senha.");
    }
  };

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
                className={pathname === "/usuarios" ? styles.active : ""}
                onClick={() => router.push("/usuarios")}
                style={{ cursor: "pointer" }}
              >
                <FaUsers style={{ fontSize: "30px" }} className={styles.icon} />
                {sidebarOpen && (
                  <span className={styles.itemText}>Usuarios</span>
                )}
              </li>

              <li
                className={pathname === "/pesquisarEscala" ? styles.active : ""}
                onClick={() => router.push("/pesquisarEscala")}
                style={{ cursor: "pointer" }}
              >
                <FaSearch
                  style={{ fontSize: "30px" }}
                  className={styles.icon}
                />
                {sidebarOpen && (
                  <span className={styles.itemText}>Usuarios</span>
                )}
              </li>

              {[1, 3, 5, 10].includes(user?.typeUser) && (
                <li
                  onClick={() => {
                    fetchMesesData();
                    setShowMesesModalNovo(true);
                  }}
                  className={pathname === "/pjes" ? styles.active : ""}
                  style={{ cursor: "pointer" }}
                >
                  <FaCalendar
                    style={{ fontSize: "25px" }}
                    className={styles.icon}
                  />
                  {sidebarOpen && <span className={styles.itemText}>PJES</span>}
                </li>
              )}
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
                    <FaAlignCenter className={styles.menuIcon} />
                    <span className={styles.geralSenhaPjes}></span>
                  </li>
                  <li
                    className={
                      activeTab === "senha" ? styles.activeMenuItem : ""
                    }
                    onClick={() => setActiveTab("senha")}
                  >
                    <FaKey className={styles.menuIcon} />
                    <span className={styles.geralSenhaPjes}></span>
                  </li>
                  <li
                    className={
                      activeTab === "meuspjes" ? styles.activeMenuItem : ""
                    }
                    onClick={() => setActiveTab("meuspjes")}
                  >
                    <FaSitemap className={styles.menuIcon} />
                    <span className={styles.geralSenhaPjes}></span>
                  </li>
                </ul>
                <div className={styles.modalFooterLeft}>
                  <div
                    className={styles.profileFooterItem}
                    onClick={() => setShowUserModal(false)}
                  >
                    <FaUser />
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
                        className={styles.imgUserModal}
                      />
                    </div>

                    {/* Nome, matrícula e função */}
                    <div className={styles.identificacaoUser}>
                      <p>
                        {user.pg} {user.nomeGuerra} {user.ome?.nomeOme}
                      </p>
                    </div>

                    {/* Restante dos dados */}
                    <div className={styles.seiFuncaoTelEmail}>
                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaUserTag style={{ marginRight: "8px" }} />
                        <span>{user.loginSei}</span>
                      </div>

                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaIdBadge className={styles.faSeiFuncaoTelEmail} />
                        <span>{user.funcao}</span>
                      </div>

                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaUniversity className={styles.faSeiFuncaoTelEmail} />
                        <span> {user.ome?.diretoria?.nomeDiretoria}</span>
                      </div>

                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaPhone className={styles.faSeiFuncaoTelEmail} />
                        <span>{user.phone}</span>
                      </div>

                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaEnvelope className={styles.faSeiFuncaoTelEmail} />
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {/* Linha divisória */}
                    <hr className={styles.hrSeiFuncaoTelEmail} />

                    <div className={styles.modalFooterLeft}>
                      <div
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
                    <div style={{ marginBottom: "1rem" }}>
                      <FaKey className={styles.imgSenhaModal} />
                    </div>

                    {/* Restante dos dados */}
                    <div className={styles.seiFuncaoTelEmail}>
                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaKeycdn style={{ marginRight: "8px" }} />
                        <input
                          type="password"
                          placeholder="Senha atual"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.divSeiFuncaoTelEmail}>
                        <FaKey className={styles.faSeiFuncaoTelEmail} />
                        <input
                          type="password"
                          placeholder="Nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </div>

                    {/* Linha divisória */}
                    <hr className={styles.hrSeiFuncaoTelEmail} />

                    <div className={styles.modalFooterLeft}>
                      <div
                        className={styles.profileFooterItem}
                        onClick={handleChangePassword}
                      >
                        <FaKey className={styles.menuIcon} />
                        <span>Atualizar Senha</span>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "meuspjes" && (
                  <>
                    <Calendar
                      onChange={(value: Date | Date[]) => {
                        const selected = Array.isArray(value)
                          ? value[0]
                          : value;
                        setDate(selected);
                      }}
                      value={date}
                      className={styles.customCalendar}
                      tileContent={({ date, view }: TileProps) => {
                        if (view === "month") {
                          const diaStr = date.toISOString().split("T")[0];
                          const escalaDoDia = escalas.find(
                            (esc) => esc.dia === diaStr
                          );

                          if (escalaDoDia) {
                            return (
                              <div
                                style={{ fontSize: "0.5rem", color: "blue" }}
                              >
                                {escalaDoDia.nomeOme}
                              </div>
                            );
                          }
                        }
                        return null;
                      }}
                    />

                    <div style={{ flex: 1, marginTop: "10px" }}>
                      <div className={styles.eventoTextoMinhaEscala}>
                        <div className={styles.escalaInfo}>
                          {(() => {
                            const diaStr = date.toLocaleDateString("sv-SE");
                            const escalaDoDia = escalas.find(
                              (esc) => esc.dia === diaStr
                            );

                            if (escalaDoDia) {
                              const { dia, nomeMes } = formatDate(
                                escalaDoDia.dia
                              );
                              return (
                                <div>
                                  <div
                                    style={{
                                      textAlign: "right",
                                      fontSize: "12px",
                                    }}
                                  >
                                    COP: <strong>{escalaDoDia.codOp}</strong>
                                  </div>
                                  <div className={styles.escalaLinha}>
                                    <div className={styles.dataColuna}>
                                      <span className={styles.dia}>{dia}</span>
                                      <span className={styles.mes}>
                                        {nomeMes}
                                      </span>
                                      <span className={styles.horarioEscala}>
                                        {escalaDoDia.horaInicio.slice(0, 5)} às{" "}
                                        {escalaDoDia.horaFinal.slice(0, 5)}
                                      </span>
                                    </div>

                                    <div style={{ width: "60%" }}>
                                      <span className={styles.nome}>
                                        {escalaDoDia.nomeOperacao} |{" "}
                                        {escalaDoDia.nomeOme}
                                      </span>
                                      <div
                                        className={styles.detalhesItemCalendar}
                                      >
                                        <FaMapMarkerAlt />
                                        <span
                                          className={styles.localApresentacao}
                                        >
                                          {escalaDoDia.localApresentacaoSgp}
                                        </span>
                                      </div>
                                      <div className={styles.detalhesContainer}>
                                        <div
                                          className={
                                            styles.detalhesItemCalendar
                                          }
                                        >
                                          <FaAirbnb />
                                          <span className={styles.detalheTexto}>
                                            Função: {escalaDoDia.funcao}
                                          </span>
                                        </div>
                                        <div
                                          className={
                                            styles.detalhesItemCalendar
                                          }
                                        >
                                          <FaUser />
                                          <span className={styles.detalheTexto}>
                                            {escalaDoDia.situacaoSgp}
                                          </span>
                                        </div>
                                      </div>

                                      <div
                                        className={
                                          styles.detalhesAnotacaoEscala
                                        }
                                      >
                                        <div
                                          className={
                                            styles.detalhesItemCalendar
                                          }
                                        >
                                          <FaInfo />
                                          <span className={styles.detalheTexto}>
                                            Anotações:{" "}
                                          </span>
                                          <strong>
                                            {escalaDoDia.anotacaoEscala}
                                          </strong>
                                        </div>
                                      </div>
                                      <h1>Situação da Escala</h1>
                                      <div
                                        className={styles.detalhesItemCalendar}
                                      >
                                        {escalaDoDia.statusEscala ===
                                        "HOMOLOGADA" ? (
                                          <>
                                            <FaCheckSquare
                                              style={{ color: "green" }}
                                            />
                                            <span
                                              className={
                                                styles.statusConfirmado
                                              }
                                            >
                                              CONFIRMADA
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <FaTriangleExclamation
                                              style={{ color: "#b60b0b" }}
                                            />
                                            <span
                                              className={styles.statusPendente}
                                            >
                                              {escalaDoDia.statusEscala}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div
                                        className={styles.detalhesItemCalendar}
                                      >
                                        <div className={styles.usuarioLogInfo}>
                                          {escalaDoDia.statusEscala ===
                                          "AUTORIZADA" ? (
                                            <p>Aguardando confirmação</p>
                                          ) : (
                                            <>
                                              <Image
                                                width={10}
                                                height={10}
                                                src={
                                                  escalaDoDia.ultimoStatusLog
                                                    ?.imagemUrl ||
                                                  "/assets/images/user_padrao.png"
                                                }
                                                alt="img_usuario"
                                                className={
                                                  styles.imgUserModalAlteracao
                                                }
                                              />
                                              <span
                                                className={styles.statusUsuario}
                                              >
                                                <strong>
                                                  {
                                                    escalaDoDia.ultimoStatusLog
                                                      ?.pg
                                                  }{" "}
                                                  {
                                                    escalaDoDia.ultimoStatusLog
                                                      ?.nomeGuerra
                                                  }
                                                </strong>{" "}
                                                {
                                                  escalaDoDia.ultimoStatusLog
                                                    ?.nomeOme
                                                }{" "}
                                                às{" "}
                                                {formatarDataHoraBR(
                                                  escalaDoDia.ultimoStatusLog
                                                    ?.dataAlteracao ?? ""
                                                )}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      className={
                                        styles.divPendenteProfilePrincipal
                                      }
                                    >
                                      {/* Status Teto */}
                                      <div
                                        className={
                                          styles.divPendenteProfileSecundaria
                                        }
                                      >
                                        {escalaDoDia.tetoStatusTeto ===
                                        "ENVIADO" ? (
                                          <>
                                            <FaCheck color="green" />
                                            <div
                                              className={
                                                styles.divPendenteProfileTerciaria
                                              }
                                            >
                                              Enviado para pagamento em{" "}
                                              {formatarDataHoraBR(
                                                escalaDoDia.tetoCreatedAtStatusTeto
                                              )}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <FaTriangleExclamation color="orange" />
                                            <div
                                              className={
                                                styles.divPendenteProfileTerciaria
                                              }
                                            >
                                              Não Enviado
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      {/* Status Pg */}
                                      <div
                                        className={
                                          styles.divPagamentoProfileSecundaria
                                        }
                                      >
                                        {escalaDoDia.tetoStatusPg === "PAGO" ? (
                                          <>
                                            <FaCheck color="green" />
                                            <div
                                              className={
                                                styles.divPagamentoProfileTerciaria
                                              }
                                            >
                                              Pagamento realizado em{" "}
                                              {formatarDataHoraBR(
                                                escalaDoDia.tetoCreatedAtStatusPg
                                              )}
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <FaTriangleExclamation color="orange" />
                                            <div
                                              className={
                                                styles.divPagamentoProfileTerciaria
                                              }
                                            >
                                              Pendente
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else {
                              return <p>Não há escala para você neste dia.</p>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* FIM MODAL PERFIL DO USUARIO */}

        {showMesesModalNovo && (
          <div className={styles.modalOverlayMeses}>
            <div
              className={styles.mesesModal}
              ref={mesesModalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalLeftMeses}>
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
                    className={styles.mesesFooterItem}
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
