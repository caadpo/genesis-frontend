"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { MdAttachMoney } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import styles from "./privateLayout.module.css";
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaFilter,
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
import Link from "next/link";

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
  const [showMesesModalNovo, setShowMesesModalNovo] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [resumo, setResumo] = useState<{ mes: string, totalCotas: number, valorTotal: number } | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1); // de 1 a 12

  const [showCodOpModal, setShowCodOpModal] = useState(false);
  const [operacaoCodOp, setOperacaoCodOp] = useState<any>(null);
  const [loadingCodOp, setLoadingCodOp] = useState(false);
  const [errorCodOp, setErrorCodOp] = useState("");
  const [selectedEscala, setSelectedEscala] = useState<Escala | null>(null);





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

  const router = useRouter();
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

  useEffect(() => {
    const fetchMinhasEscalas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pjesescala/minhas-escalas?ano=${anoSelecionado}&mes=${mesSelecionado}`);
        const data = await res.json();
  
        if (!res.ok) throw new Error(data.error || "Erro ao buscar escalas");
  
        setEscalas(data.escalas);
        setResumo(data.resumo);
      } catch (error: any) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMinhasEscalas();
  }, [anoSelecionado, mesSelecionado]);
  
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

  //INICIO FUNÇÃO PARA CHMAR OS MESES DO ANO
    const anosMeses: { [ano: string]: string[] } = {
    2025: ["AGO", "SET", "OUT" , "NOV" , "DEZ"],
    2026: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT" , "NOV" , "DEZ"],
    2027: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT" , "NOV" , "DEZ"],
    2028: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT" , "NOV" , "DEZ"],
    2029: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT" , "NOV" , "DEZ"],
    2030: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT" , "NOV" , "DEZ"],
  };
  
  // FIM FUNÇÃO CHAMAR MESES DO ANO

  if (!user) return <div>Você não está autenticado.</div>;

  if (isLoading) return <div>Carregando...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }


  async function abrirModalCodOp(codOp: string) {
    try {
      setLoadingCodOp(true);
      setErrorCodOp("");
      setShowCodOpModal(true);
  
      const res = await fetch(`/api/pjesoperacao/by-codop?codOp=${codOp}`);
  
      if (!res.ok) {
        const data = await res.json();
        setErrorCodOp(data.error || "Erro desconhecido");
        return;
      }
  
      const data = await res.json();
      setOperacaoCodOp(data);
    } catch (err) {
      setErrorCodOp("Erro ao conectar com o servidor");
    } finally {
      setLoadingCodOp(false);
    }
  }

  const ordenarEscalas = (escalas: any[]) => {
    const funcaoOrdem: Record<string, number> = { FISCAL: 1, MOT: 2, PAT: 3 };
  
    return escalas.slice().sort((a, b) => {
      const dataA = new Date(`${a.dataInicio}T${a.horaInicio}`);
      const dataB = new Date(`${b.dataInicio}T${b.horaInicio}`);
  
      const compareDate = dataA.getTime() - dataB.getTime();
      if (compareDate !== 0) return compareDate;
  
      const funcaoA = funcaoOrdem[a.funcao] || 99;
      const funcaoB = funcaoOrdem[b.funcao] || 99;
  
      return funcaoA - funcaoB;
    });
  };


  const formatarDataParaDiaMes = (dataStr: string) => {
    const data = getDataLocal(dataStr); // <- isso evita o erro de fuso
    return data
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      .slice(0, 5);
  };

  const getDataLocal = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  };
  

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
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  width={28}
                  height={28}
                  src={user.imagemUrl || "/assets/images/user_padrao.png"}
                  alt="img_usuario"
                  className={styles.iconUser}
                />

                <div
                  style={{
                    display: "block",
                    textAlign: "left",
                    fontWeight: "bold",
                    color: "#646060",
                    fontSize: "10px",
                  }}
                >
                  <div>
                    {user.pg} {user.nomeGuerra} {user.ome?.nomeOme}
                  </div>

                  <div>{user.funcao}</div>
                </div>
              </div>
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
                            type="text"
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
                        onChange={(value) => {
                          if (!value) {
                            setDate(null); // para tratar caso seja null
                            return;
                          }
                          const selected = Array.isArray(value) ? value[0] : value;
                          setDate(selected);
                        }}
                        onActiveStartDateChange={({ activeStartDate }) => {
                          if (activeStartDate) {
                            setAnoSelecionado(activeStartDate.getFullYear());
                            setMesSelecionado(activeStartDate.getMonth() + 1);
                          }
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
                                  style={{ fontSize: "0.6rem", color: "blue" }}
                                >
                                <strong>{escalaDoDia.nomeOme}</strong>
                                </div>
                              );
                            }
                          }
                          return null;
                        }}
                      />

                      
                        {resumo && (
                          <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                            <div className={styles.divIconeConsumo}>
                              <MdAttachMoney fontSize={60} color="#ccc" />
                            </div>
                            <div style={{display:"block", textAlign:"end"}}>
                              <div style={{fontSize:"13px", color:"grey"}}>Minha Escala: {resumo.totalCotas} Cota(s)</div>
                              <div style={{fontSize:"13px", color:"grey"}}>Repasses: 0 Cota(s)</div>
                              <div style={{fontSize:"14px", color:"green"}}><strong>Total: {resumo.totalCotas} Cota(s)</strong>{" "}| {" "}
                              <strong>R$ {resumo.valorTotal.toFixed(2).replace(".", ",")}</strong></div>
                              <div></div>
                            </div>
                          </div>
                            </>
                        )}
                      

                      <div style={{ flex: 1, marginTop: "5px" }}>
                        <div className={styles.eventoTextoMinhaEscala}>
                          <div className={styles.escalaInfo}>
                            {(() => {

                              if (!date) return null;
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
                                      COP: <strong
                                        style={{ cursor: "pointer", color: "#064fb4" }}
                                        onClick={() => abrirModalCodOp(escalaDoDia.codOp)}
                                      >
                                        {escalaDoDia.codOp}
                                      </strong>

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
                                        <div className={styles.detalhesItemCalendar}>
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
                                              {" "}
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
                                                  em{" "}
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

                                      <div className={ styles.divPendenteProfilePrincipal}>
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
                                                {formatarDataHoraBR(escalaDoDia.tetoCreatedAtStatusTeto ?? "")}

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
                                                  escalaDoDia.tetoCreatedAtStatusPg ?? "")}
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
            <div className={styles.mesesModal}>
                <div className={styles.modalLeftMeses}>
                  <ul className={styles.modalMenu}>
                    {Object.keys(anosMeses).map((ano) => (
                      <li
                        key={ano}
                        className={activeTab === ano ? styles.activeMenuItem : ""}
                        onClick={() => setActiveTab(ano)}
                      >
                        <FaCalendar className={styles.menuIcon} />
                        <span style={{ fontSize: "15px", marginLeft: "5px" }}>{ano}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.modalFooterLeft}>
                    <div className={styles.mesesFooterItem}>
                      <FaCalendar className={styles.menuIcon} />
                    </div>
                  </div>
                </div>
                <div className={styles.modalRight}>
                  <div
                    style={{
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {anosMeses[activeTab]?.map((mes) => (
                      <a
                        key={mes}
                        className={styles.botaoVerde}
                        href={`/pjes?ano=${activeTab}&mes=${mes}`}
                      >
                        <FaCalendar style={{ marginRight: "8px" }} />
                        {mes}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        )}

        {showCodOpModal && (
        <div className={styles.modalOverlay}
          onClick={() => {
            setShowCodOpModal(false);
            setOperacaoCodOp(null);
          }}
        >
          <div className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}>
            {loadingCodOp && <p>Carregando...</p>}

            {errorCodOp && (
              <p style={{ color: "red", fontWeight: "bold" }}>{errorCodOp}</p>
            )}

            {operacaoCodOp && (
              <div className={styles.divCodOperacaoLayout} style={{ padding: "10px",
              maxHeight: "70vh",
              overflowY: "auto", }}>
                
                {/* Header com COP + Filtro Hoje */}
                <div>
                  Escala de Serviço
                  <div className={styles.nomeOperacaoTelaPesquisar}>
                    <strong>{operacaoCodOp.nomeOme} | {operacaoCodOp?.pjesevento?.nomeEvento}</strong>
                  </div>
                  <div>
                    <strong>{operacaoCodOp.nomeOperacao}</strong> | COP: {operacaoCodOp.codOp}
                  </div>
                </div>

                
                {/* Lista de escalas */}
                {ordenarEscalas(operacaoCodOp.pjesescalas).map((escala: any) => (
                <div key={escala.id} className={styles.usuarioCard}>
                  <div style={{ display: "flex", width: "100%" }}>
                    <FaUser className={styles.usuarioSemImagemTelaPesquisar} />


                      <div className={styles.usuarioInfo}>
                        <span className={styles.usuarioNomePesquisarOperacao}>
                          {escala.pgSgp} {escala.matSgp} {escala.nomeGuerraSgp} {escala.omeSgp}
                          <span style={{ paddingLeft: "5px", color: "#0740dd" }}>
                            | {escala.funcao}
                          </span>
                        </span>

                        <div className={styles.usuarioLinha}>
                          <div style={{ display: "flex" }}>
                            <FaCalendar className={styles.iconUsuarioList} />
                            <span className={styles.usuarioFuncao}>
                              {formatarDataParaDiaMes(escala.dataInicio)}{" "}
                              <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                                {escala.horaInicio.slice(0, 5)} às{" "}
                                {escala.horaFinal.slice(0, 5)}
                              </span>
                            </span>
                          </div>

                          <div style={{ display: "flex" }}>
                            <FaPhone className={styles.iconUsuarioList} />
                            <span className={styles.usuarioFuncao}>{escala.phone}</span>
                          </div>
                        </div>
                      </div>
                      {/* Ícones de ação */}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </UserProvider>
  );
}
