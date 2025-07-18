"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import styles from "../privateLayout.module.css";
import {
  FaAngleDoubleUp,
  FaCheckSquare,
  FaClock,
  FaComment,
  FaDatabase,
  FaDownload,
  FaEdit,
  FaFilePdf,
  FaForward,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaRegSquare,
  FaStar,
  FaTrash,
  FaUserSlash,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import DistribuicaoModal from "@/components/DistribuicaoModal";
import EventoModal from "@/components/EventoModal";
import OperacaoModal from "@/components/OperacaoModal";
import EscalaModal from "@/components/EscalaModal";
import ObsModal from "@/components/ObsModal";
import TabelaResumoPorDiretoria from "@/components/TabelaResumoPorDiretoria";
import { useUser } from "@/app/context/UserContext";
import { useCarregarDadosPjes } from "./hooks/useCarregarDadosPjes";
import PrestacaoContasModal from "@/components/ModalPrestacaoContas";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Resumo {
  somaTotalCtOfEvento: number;
  somaGeralCotaOfEscala: number;
  somaTotalCtPrcEvento: number;
  somaGeralCotaPrcEscala: number;
  valorTtPlanejado: number;
  valorTtExecutado: number;
  saldoFinal: number;
}

export default function PjesPage() {
  const searchParams = useSearchParams();
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalDataEvento, setModalDataEvento] = useState<any | null>(null);
  const [mostrarModalOperacao, setMostrarModalOperacao] = useState(false);
  const [modalDataOperacao, setModalDataOperacao] = useState<any | null>(null);
  const [mostrarModalEscala, setMostrarModalEscala] = useState(false);
  const [modalDataEscala, setModalDataEscala] = useState<any | null>(null);
  const [mostrarModalObs, setMostrarModalObs] = useState(false);
  const [modalDataObs, setModalDataObs] = useState<any | null>(null);

  const [pjestetos, setPjestetos] = useState<any[]>([]);
  const [pjesdists, setPjesdists] = useState<any[]>([]);
  const [pjeseventos, setPjeseventos] = useState<any[]>([]);

  const [mostrarModalPrestacaoContas, setMostrarModalPrestacaoContas] =
    useState(false);

  const [selectedTetoId, setSelectedTetoId] = useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [selectedOperacaoId, setSelectedOperacaoId] = useState<number | null>(
    null
  );

  const [mostrarTeto] = useState(true);
  const [mostrarDist] = useState(true);
  const [mostrarEvento] = useState(true);
  const [mostrarOperacao] = useState(true);

  const [buscaEventos, setBuscaEventos] = useState("");
  const [busca, setBusca] = useState("");
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const escalasPorPagina = 50;

  const mapMes: Record<string, number> = {
    JAN: 1,
    FEV: 2,
    MAR: 3,
    ABR: 4,
    MAI: 5,
    JUN: 6,
    JUL: 7,
    AGO: 8,
    SET: 9,
    OUT: 10,
    NOV: 11,
    DEZ: 12,
  };

  const mesNum = mapMes[(mes || "").toUpperCase().trim()];

  const [resumoDim, setResumoDim] = useState<Resumo | null>(null);
  const [resumoDiresp, setResumoDiresp] = useState<Resumo | null>(null);
  const [resumoDinteri, setResumoDinteri] = useState<Resumo | null>(null);
  const [resumoDinterii, setResumoDinterii] = useState<Resumo | null>(null);
  const [resumoDpo, setResumoDpo] = useState<Resumo | null>(null);
  const [cotasPorMatricula, setCotasPorMatricula] = useState<{
    [mat: string]: number;
  }>({});

  const user = useUser();
  const userId = user?.id;

  const visualizarDist = (type?: number) =>
    type !== undefined && [4, 5, 10].includes(type);
  const cadastrarDist = (type?: number) =>
    type !== undefined && [4, 5, 10].includes(type);

  // 🔁 Gatilho para recarregar dados
  const [pjesevento, setPjesevento] = useState(0);

  type EventoComOperacoes = {
    operacoes?: any[];
    escalas?: any[];
    [key: string]: any; // permite outras chaves sem erro
  };

  const {
    eventos,
    atualizarOperacao,
    tetos,
    dists,
    resumoPorDiretoria,
    ome,
    diretoria,
    loading,
    erro,
  } = useCarregarDadosPjes(ano, mesNum, pjesevento) as {
    eventos: EventoComOperacoes[];
    tetos: any[];
    dists: any[];
    resumoPorDiretoria: any[];
    ome: any[];
    diretoria: any[];
    loading: boolean;
    erro: string | null;
  };

  const atualizarDados = () => setPjesevento((prev) => prev + 1);

  const dadosCarregando = loading || !ano || !mesNum;

  // Carregamento inicial
  useEffect(() => {
    if (tetos.length > 0) setSelectedTetoId(tetos[0].id);
    setPjestetos(tetos);
    setPjesdists(dists);
    setPjeseventos(eventos);
  }, [tetos, dists, eventos]);

  useEffect(() => {
    const carregarResumos = async () => {
      if (!ano || !mesNum) return;

      const anoNum = parseInt(ano || "0", 10);
      const mesFinal = parseInt(String(mesNum || "0"), 10);

      const fetchResumo = async (
        ano: number,
        mes: number,
        omeMin: number,
        omeMax: number
      ): Promise<Resumo | null> => {
        try {
          const res = await fetch(
            `/api/pjesevento/resumo-por-diretoria?ano=${ano}&mes=${mes}&omeMin=${omeMin}&omeMax=${omeMax}`
          );
          const data = await res.json();

          if (res.ok) return data.resumo;
          console.error("Erro ao buscar resumo:", data.error);
          return null;
        } catch (error) {
          console.error("Erro de rede:", error);
          return null;
        }
      };

      setResumoDim(await fetchResumo(anoNum, mesFinal, 2, 14));
      setResumoDiresp(await fetchResumo(anoNum, mesFinal, 15, 28));
      setResumoDinteri(await fetchResumo(anoNum, mesFinal, 29, 43));
      setResumoDinterii(await fetchResumo(anoNum, mesFinal, 44, 55));
      setResumoDpo(await fetchResumo(anoNum, mesFinal, 56, 74));
    };

    carregarResumos();
  }, [ano, mesNum]);

  //parte 3

  const handleTetoClick = (id: number) => {
    setSelectedTetoId(id);
    setSelectedDistId(null);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleDistClick = (id: number) => {
    setSelectedDistId(id);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleEventoClick = (id: number) => {
    setSelectedEventoId(id);
    setSelectedOperacaoId(null);

    // O restante dos dados (operações/escalas) virá do hook via eventos
  };

  const handleOperacaoClick = (id: number) => {
    const novoId = selectedOperacaoId === id ? null : id;
    setSelectedOperacaoId(novoId);
  };

  const toggleMenu = (id: number) => {
    setMenuAbertoId((prev) => (prev === id ? null : id));
  };

  const carregarOperacoesDoEvento = (eventoId: number) => {
    const evento = eventos.find((ev) => ev.id === eventoId);

    if (!evento) {
      console.warn("Evento não encontrado");
      return { operacoes: [], escalas: [] };
    }

    const operacoes = evento.operacoes || [];
    const escalas = operacoes.flatMap((op) => op.pjesescalas || []);

    return { operacoes, escalas };
  };

  const distSelecionado = pjesdists.filter(
    (dist) => dist.pjesTetoId === selectedTetoId
  );

  const eventoSelecionadoObj = eventos.find((e) => e.id === selectedEventoId);

  const eventoSelecionado = useMemo(() => {
    const eventosFiltrados = selectedDistId
      ? eventos.filter((evento) => evento.pjesDistId === selectedDistId)
      : eventos;

    if (!buscaEventos.trim()) return eventosFiltrados;

    const termo = buscaEventos.toLowerCase();

    return eventosFiltrados.filter((evento) => {
      return (
        evento.nomeEvento?.toLowerCase().includes(termo) ||
        evento.nomeOme?.toLowerCase().includes(termo) ||
        evento.statusEvento?.toLowerCase().includes(termo) ||
        evento.codVerba?.toString().includes(termo)
      );
    });
  }, [eventos, selectedDistId, buscaEventos]);

  const operacaoSelecionada = useMemo(() => {
    const evento = eventos.find((ev) => ev.id === selectedEventoId);
    console.log("Evento selecionado para operações:", evento);
    return evento?.pjesoperacoes || [];
  }, [eventos, selectedEventoId]);

  const escalasFiltradasPorOperacao = useMemo(() => {
    const resultado: Record<number, any[]> = {};
    const termo = busca.toLowerCase();

    operacaoSelecionada.forEach((op) => {
      const escalas = op.pjesescalas || [];

      resultado[op.id] = escalas
        .filter((escala) => {
          return (
            escala.nomeGuerraSgp?.toLowerCase().includes(termo) ||
            escala.nomeCompletoSgp?.toLowerCase().includes(termo) ||
            escala.pgSgp?.toLowerCase().includes(termo) ||
            escala.matSgp?.toString().includes(termo) ||
            escala.phone?.toString().includes(termo) ||
            escala.localApresentacaoSgp?.toLowerCase().includes(termo) ||
            escala.statusEscala?.toLowerCase().includes(termo) ||
            new Date(escala.dataInicio)
              .toLocaleDateString("pt-BR")
              .includes(termo)
          );
        })
        .sort(
          (a, b) =>
            new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
        );
    });

    return resultado;
  }, [operacaoSelecionada, busca]);

  const getImagemPorCodVerba = (codVerba: number): string => {
    switch (codVerba) {
      case 247:
        return "/assets/images/dpo_logo.png";
      case 263:
        return "/assets/images/pe_logo.png";
      case 255:
        return "/assets/images/mobi_logo.png";
      case 251:
        return "/assets/images/alepe_logo.png";
      case 253:
        return "/assets/images/mppe_logo.jpg";
      case 250:
        return "/assets/images/brasil_logo.png";
      default:
        return "/assets/images/logo.png";
    }
  };

  function formatarDataISOParaBR(isoDateString: string) {
    const [ano, mes, dia] = isoDateString.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const menuItemStyle = {
    padding: "8px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "13px",
    borderBottom: "1px solid #444",
  };

  // parte 5

  const handleEditarEvento = (evento: any) => {
    setModalDataEvento(evento);
    setMostrarModalEvento(true);
  };

  const handleExcluirEvento = async (eventoId: number) => {
    const confirmar = confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/pjesevento/${eventoId}`, {
        method: "DELETE",
      });

      const resultado = await res.json();

      if (!res.ok) {
        alert(resultado?.error || "Erro ao excluir evento.");
        return;
      }
      atualizarDados();

      setPjeseventos((prev) => prev.filter((ev) => ev.id !== eventoId));
      alert("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro interno ao excluir.");
    }
  };

  const handleExcluirOperacao = async (operacaoId: number) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta operação?");
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/pjesoperacao/${operacaoId}`, {
        method: "DELETE",
      });

      const resultado = await res.json();

      if (!res.ok) {
        alert(resultado?.error || "Erro ao excluir operação.");
        return;
      }

      alert("Operação excluída com sucesso!");
      atualizarDados(); // ✅ Atualiza os dados após exclusão
    } catch (error) {
      console.error("Erro ao excluir operação:", error);
      alert("Erro interno ao excluir.");
    }
  };

  const handleToggleStatus = async (evento: any) => {
    const novoStatus =
      evento.statusEvento === "AUTORIZADA" ? "HOMOLOGADA" : "AUTORIZADA";

    try {
      const res = await fetch(`/api/pjesevento/${evento.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statusEvento: novoStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Erro ao alterar status: ${data.error}`);
        return;
      }

      // ✅ FORÇA A ATUALIZAÇÃO DOS DADOS NO HOOK
      atualizarDados();

      // Fecha o menu
      setMenuAbertoId(null);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro interno ao alterar status");
    }
  };

  const toggleStatusEscala = async (escala: any) => {
    const novoStatus =
      escala.statusEscala === "HOMOLOGADA" ? "AUTORIZADA" : "HOMOLOGADA";

    try {
      const res = await fetch(`/api/pjesescala/${escala.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusEscala: novoStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao atualizar status da escala.");
        return;
      }

      atualizarTotaisOperacoes(selectedOperacaoId!);
      atualizarDados(); // ✅ Atualiza os dados após exclusão
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro interno ao atualizar status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;

    try {
      const res = await fetch(`/api/pjesescala/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        alert(`Erro ao excluir: ${data.error}`);
        return;
      }

      atualizarTotaisOperacoes(selectedOperacaoId!);
      atualizarDados(); // ✅ Atualiza os dados após exclusão
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao excluir.");
    }
  };

  const atualizarTotaisOperacoes = (operacaoIdAtualizada: number) => {
    // Encontrar a operação e escalas nos dados atuais
    let operacao;
    let escalasDaOperacao: any[] = [];

    for (const evento of eventos) {
      const op = evento.operacoes?.find((o) => o.id === operacaoIdAtualizada);
      if (op) {
        operacao = op;
        escalasDaOperacao = op.pjesescalas || [];
        break;
      }
    }

    if (!operacao) return;

    const ttCtOfExeOper = escalasDaOperacao
      .filter((esc) => esc.tipoSgp === "O" && esc.statusEscala === "AUTORIZADA")
      .reduce((total, esc) => total + (esc.ttCota || 0), 0);

    const ttCtPrcExeOper = escalasDaOperacao
      .filter((esc) => esc.tipoSgp === "P" && esc.statusEscala === "AUTORIZADA")
      .reduce((total, esc) => total + (esc.ttCota || 0), 0);

    atualizarOperacao(operacaoIdAtualizada, { ttCtOfExeOper, ttCtPrcExeOper });
  };

  async function salvarOuAtualizarEscala(dados: any): Promise<boolean> {
    const isEdit = Boolean(dados.id);

    const params = new URLSearchParams({
      ano: String(ano),
      mes: String(mesNum),
    });

    const url = isEdit
      ? `/api/pjesescala/${dados.id}?${params.toString()}`
      : `/api/pjesescala?${params.toString()}`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const text = await res.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        console.error("Resposta não é JSON válido:", text);
        alert("Erro inesperado ao salvar escala.");
        return false;
      }

      if (!res.ok) {
        alert(result?.error || "Erro ao salvar escala.");
        return false;
      }

      await carregarOperacoesDoEvento(selectedEventoId!);
      return true;
    } catch (error) {
      console.error("Erro ao salvar Escala:", error);
      alert("Erro interno ao salvar Escala.");
      return false;
    }
  }

  useEffect(() => {
    const buscarCotas = async () => {
      if (!ano || !mes) return;

      const anoNum = Number(ano);
      const mesNumFinal = mapMes[(mes || "").toUpperCase().trim()];
      if (!mesNumFinal) return;

      const mesNumStr = String(mesNumFinal).padStart(2, "0");

      // Deriva todas as escalas dentro de eventos:
      const todasEscalas = eventos.flatMap(
        (ev) => ev.pjesoperacoes?.flatMap((op) => op.pjesescalas || []) || []
      );

      const matriculasUnicas = Array.from(
        new Set(
          todasEscalas.map((esc) => esc.matSgp?.toString()).filter(Boolean)
        )
      );

      const cotasTemp: { [mat: string]: number } = {};
      await Promise.all(
        matriculasUnicas.map(async (mat) => {
          try {
            const res = await fetch(
              `/api/cotas/soma?matSgp=${mat}&ano=${anoNum}&mes=${mesNumStr}`,
              { credentials: "include" }
            );
            const data = await res.json();
            cotasTemp[mat] = data.quantidade || 0;
          } catch (e) {
            console.error(`Erro ao buscar cotas de ${mat}:`, e);
            cotasTemp[mat] = 0;
          }
        })
      );

      setCotasPorMatricula(cotasTemp);
    };

    // Só executa se tiver eventos com operações e escalas
    if (eventos.length > 0) {
      buscarCotas();
    }
  }, [eventos, ano, mes]);

  useEffect(() => {
    if (selectedOperacaoId) {
      atualizarTotaisOperacoes(selectedOperacaoId);
    }
  }, [eventos, selectedOperacaoId]);

  //VARIAVEL PARA CONTAR IMPEDIDOS E EVENTOS AUTORIZADOS
  const selectedDist = distSelecionado.find((d) => d.id === selectedDistId);

  // INICIO CONG DO GRAFICO
  const chartData = {
    labels: distSelecionado.map((dist) => dist.nomeDiretoria),
    datasets: [
      {
        label: "Of Dist",
        data: distSelecionado.map((dist) => dist.ttCtOfDist),
        backgroundColor: "#5e96ff",
      },
      {
        label: "Of Exe",
        data: distSelecionado.map((dist) => dist.ttCotaOfEscala),
        backgroundColor: "#214fa5",
      },
      {
        label: "Prc Dist",
        data: distSelecionado.map((dist) => dist.ttCtPrcDist),
        backgroundColor: "#4ef064",
      },
      {
        label: "Prc Exe",
        data: distSelecionado.map((dist) => dist.ttCotaPrcEscala),
        backgroundColor: "#168325",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 10,
        bottom: 0,
      },
    },
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 10,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
    },
  };

  // FIM CONG DO GRAFICO

  // Função para remover acentos e caracteres especiais e trocar espaços por _
  function removerCaracteresEspeciais(str: string): string {
    return str
      .replace(/[^ -~]+/g, "") // remove todos os caracteres não ASCII visíveis (como º, ª, Â)
      .normalize("NFD") // normaliza acentos
      .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
      .replace(/[^a-zA-Z0-9\s]/g, "") // remove outros símbolos especiais
      .replace(/\s+/g, "_"); // substitui espaços por _
  }

  return (
    <div>
      {dadosCarregando ? (
        <p>Carregando dados...</p>
      ) : (
        <div className={styles.divReturn}>
          <div>
            {mostrarTeto && (
              <div className={styles.divTetoPrincipal}>
                <div className={styles.divTetoSecundaria}>
                  <h3>
                    {" "}
                    <strong>
                      {" "}
                      PJES {mes} | {ano}{" "}
                    </strong>{" "}
                  </h3>
                </div>
                <ul className={styles.ulTeto}>
                  {pjestetos.map((teto) => (
                    <li
                      key={teto.id}
                      onClick={() => handleTetoClick(teto.id)}
                      className={`${styles.liTeto} ${
                        selectedTetoId === teto.id
                          ? styles.selected
                          : styles.notSelected
                      }`}
                    >
                      <Image
                        width={selectedTetoId === teto.id ? 60 : 45} // ainda necessário para o Next/Image
                        height={selectedTetoId === teto.id ? 60 : 45}
                        src={teto.imagemUrl || "/assets/images/logo.png"}
                        alt="logo"
                        className={`${styles.imageTeto} ${
                          selectedTetoId === teto.id
                            ? styles.imageSelecionada
                            : styles.imageNaoSelecionada
                        }`}
                      />

                      <div className={styles.divNomeVerba}>
                        {" "}
                        <strong>{teto.nomeVerba}</strong>{" "}
                      </div>

                      {visualizarDist(user?.typeUser) && (
                        <div className={styles.divDistribuicaoCotas}>
                          <span className={styles.spanDistribuicaoCotas}>
                            <FaStar /> {teto.tetoOf} |{" "}
                            {teto.ttCotaOfDisponivelDistribuir}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "9px",
                            }}
                          >
                            <FaDatabase /> {teto.ttCotaOfSaldo}
                          </span>
                        </div>
                      )}

                      {visualizarDist(user?.typeUser) && (
                        <div className={styles.divDistribuicaoCotas}>
                          <span className={styles.spanDistribuicaoCotas}>
                            <FaAngleDoubleUp /> {teto.tetoPrc} |{" "}
                            {teto.ttCotaPrcDisponivelDistribuir}
                          </span>
                          <span className={styles.spanDistribuicaoCotas}>
                            <FaDatabase /> {teto.ttCotaPrcSaldo}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/*{mostrarDist && user?.typeUser !== 1 && (*/}
            {mostrarDist && user?.typeUser !== 1 && user?.typeUser !== 2 && (
              <div className={styles.divDistPrincipal}>
                {/* INICIO DIV DA ESQUERDA*/}
                <div style={{ width: "60%" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <h3>
                      <strong>DISTRIBUIÇÃO</strong>
                    </h3>
                    {cadastrarDist(user?.typeUser) && (
                      <div
                        className={styles.divBtnCadastrarDist}
                        onClick={() => {
                          setModalData(null);
                          setMostrarModal(true);
                        }}
                      >
                        <FaPlus color="#000000" />
                      </div>
                    )}
                  </div>
                  <table className={styles.tableDist}>
                    <thead>
                      <tr className={styles.theadPrincipal}>
                        <th colSpan={2} className={styles.thPadrao}>
                          Diretoria
                        </th>
                        <th className={styles.thPadrao}>Distribuição</th>
                        <th className={styles.thPadrao}>
                          Oficiais (Distribuídas)
                        </th>
                        <th className={styles.thPadrao}>
                          Oficiais (Executadas)
                        </th>
                        <th className={styles.thPadrao}>Oficiais (Saldo)</th>
                        <th className={styles.thPadrao}>
                          Praças (Distribuídas)
                        </th>
                        <th className={styles.thPadrao}>Praças (Executadas)</th>
                        <th className={styles.thPadrao}>Praças (Saldo)</th>
                        {cadastrarDist(user?.typeUser) && (
                          <th className={styles.thPadrao}>#</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {distSelecionado.map((dist) => (
                        <tr
                          key={dist.id}
                          onClick={() => handleDistClick(dist.id)}
                          className={`${styles["zebra-row"]} ${
                            selectedDistId === dist.id
                              ? styles["linha-selecionada"]
                              : ""
                          }`}
                        >
                          <td className={styles.tdImagem}>
                            <Image
                              src={getImagemPorCodVerba(dist.codVerba)}
                              alt="logo"
                              width={25}
                              height={25}
                              className={styles.imagemTabela}
                            />
                          </td>

                          <td className={styles.tdPadrao}>
                            {dist.nomeDiretoria}
                          </td>
                          <td className={styles.tdPadrao}>{dist.nomeDist}</td>
                          <td className={styles.tdPadrao}>{dist.ttCtOfDist}</td>
                          <td className={styles.tdPadrao}>
                            {dist.ttCotaOfEscala}
                          </td>
                          <td className={styles.tdComBordaExtra}>
                            {dist.ttCotaOfSaldo}
                          </td>
                          <td className={styles.tdPadrao}>
                            {dist.ttCtPrcDist}
                          </td>
                          <td className={styles.tdPadrao}>
                            {dist.ttCotaPrcEscala}
                          </td>
                          <td className={styles.tdPadrao}>
                            {dist.ttCotaPrcSaldo}
                          </td>

                          {cadastrarDist(user?.typeUser) && (
                            <td className={styles.tdPadrao}>
                              <div className={styles.acoesContainer}>
                                <div className={styles.acaoItem}>
                                  <FaEdit
                                    className={styles.iconeAcao}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalData(dist);
                                      setMostrarModal(true);
                                    }}
                                  />
                                </div>
                                <div className={styles.acaoItem}>
                                  <FaTrash
                                    className={styles.iconeAcao}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (
                                        confirm(
                                          "Deseja realmente excluir esta distribuição?"
                                        )
                                      ) {
                                        try {
                                          await fetch(
                                            `/api/pjesdist/${dist.id}`,
                                            {
                                              method: "DELETE",
                                            }
                                          );
                                          setPjesdists((prev) =>
                                            prev.filter((d) => d.id !== dist.id)
                                          );
                                          alert(
                                            "Distribuição excluída com sucesso!"
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Erro ao excluir:",
                                            error
                                          );
                                          alert(
                                            "Erro ao excluir distribuição."
                                          );
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* FIM DIV DA ESQUERDA*/}

                {/* INICIO DIV DO MEIO */}
                <div className={styles.containerInsides}>
                  <h3>
                    <strong>INSIDES</strong>
                  </h3>

                  <div className={styles.boxResumo}>
                    {/* BLOCO 1 */}
                    <div
                      className={`${styles.blocoResumo} ${styles.blocoComSeparador}`}
                    >
                      <FaUserSlash size={28} color="orange" />
                      <div className={styles.valorResumo}>
                        {selectedDist?.ttPmsImpedidos ?? "--"}
                      </div>
                      <div>Pms Impedidos</div>
                    </div>

                    {/* BLOCO 2 */}
                    <div className={styles.blocoResumo}>
                      <FaLockOpen size={28} color="red" />
                      <div className={styles.valorResumo}>
                        {selectedDist?.ttEventosAutorizados ?? "--"}
                      </div>
                      <div>Eventos Abertos</div>
                    </div>
                  </div>
                </div>

                {/* FIM DIV DO MEIO */}

                {/* INICIO DIV DA DIREITA */}
                <div className={styles.containerGrafico}>
                  <h3>
                    <strong>GRÁFICO</strong>
                  </h3>
                  <div className={styles.boxGrafico}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
                {/* FIM DIV DA DIREITA */}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flex: 1 }}>
            {/* INICIO TABELA DE CONSUMO E EXECUÇÃO DAS DIRETORIAS POR OME */}
            <div className={styles.larguraDiretoria}>
              <div className={styles.tituloDiretoria}>
                <h3>DIRETORIAS</h3>
              </div>

              {resumoDpo && (
                <TabelaResumoPorDiretoria
                  titulo="DPO"
                  resumo={resumoDpo}
                  omeMin={56}
                  omeMax={74}
                  eventos={pjeseventos}
                />
              )}

              {resumoDim && (
                <TabelaResumoPorDiretoria
                  titulo="DIM"
                  resumo={resumoDim}
                  omeMin={2}
                  omeMax={14}
                  eventos={pjeseventos}
                />
              )}

              {resumoDiresp && (
                <TabelaResumoPorDiretoria
                  titulo="DIRESP"
                  resumo={resumoDiresp}
                  omeMin={15}
                  omeMax={28}
                  eventos={pjeseventos}
                />
              )}

              {resumoDinteri && (
                <TabelaResumoPorDiretoria
                  titulo="DINTER I"
                  resumo={resumoDinteri}
                  omeMin={29}
                  omeMax={43}
                  eventos={pjeseventos}
                />
              )}

              {resumoDinterii && (
                <TabelaResumoPorDiretoria
                  titulo="DINTER II"
                  resumo={resumoDinterii}
                  omeMin={44}
                  omeMax={55}
                  eventos={pjeseventos}
                />
              )}
            </div>
            {/* FIM TABELA DE CONSUMO E EXECUÇÃO DAS DIRETORIAS PO OME */}

            {mostrarEvento && (
              <div className={styles.eventoPrincipal}>
                <div className={styles.eventoTitulo}>
                  <h3>EVENTOS</h3>
                </div>

                <div className={styles.eventoNomePrincipal}>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={buscaEventos}
                    onChange={(e) => setBuscaEventos(e.target.value)}
                    className={styles.eventoInputBuscar}
                  />

                  <div
                    className={styles.eventoCadastrar}
                    onClick={() => {
                      if (!selectedDistId) {
                        alert("Selecione uma distribuição primeiro.");
                        return;
                      }

                      setModalDataEvento({
                        pjesDistId: selectedDistId,
                        mes: mesNum,
                        ano: Number(ano),
                        userId: userId,
                        statusEvento: "AUTORIZADA",
                      });
                      setMostrarModalEvento(true);
                    }}
                  >
                    <FaPlus color="#ff8800" />
                  </div>
                  <div
                    className={styles.operacaoCadastrar}
                    onClick={() => setMostrarModalPrestacaoContas(true)}
                    title="Prestar Contas"
                  >
                    <FaDownload color="#1f9c00" />
                  </div>
                </div>

                {eventoSelecionado.length === 0 ? (
                  <p>Nenhum evento para esta distribuição.</p>
                ) : (
                  <ul
                    style={{ padding: "2px", height: "80px", fontSize: "12px" }}
                  >
                    {eventoSelecionado.map((evento: any) => {
                      let color = "#f7911e";
                      if (evento.statusEvento === "AUTORIZADA")
                        color = "#ffffff";
                      else if (evento.statusEvento === "HOMOLOGADA")
                        color = "#ff0000";

                      return (
                        <li
                          key={evento.id}
                          onClick={() => handleEventoClick(evento.id)}
                          className={styles.eventoImagemLi}
                          style={{
                            fontWeight:
                              selectedEventoId === evento.id
                                ? "bold"
                                : "normal",
                            background:
                              selectedEventoId === evento.id
                                ? "#ffdcba"
                                : "#ffffff",
                          }}
                        >
                          {/* Botão de menu (três pontinhos) */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(evento.id);
                            }}
                            className={styles.eventoMenuEditarExcluir}
                          >
                            ⋮
                          </div>

                          {/* Submenu */}
                          {menuAbertoId === evento.id && (
                            <div
                              ref={menuRef}
                              className={styles.eventoSubMenuEditarExcluir}
                            >
                              <div
                                style={menuItemStyle}
                                onClick={() => handleToggleStatus(evento)}
                              >
                                {evento.statusEvento === "AUTORIZADA"
                                  ? "Homologar"
                                  : "Autorizar"}
                              </div>

                              <div
                                style={menuItemStyle}
                                onClick={() => handleEditarEvento(evento)}
                              >
                                Editar
                              </div>
                              <div
                                style={{
                                  ...menuItemStyle,
                                  borderBottom: "none",
                                }}
                                onClick={() => handleExcluirEvento(evento.id)}
                              >
                                Excluir
                              </div>
                            </div>
                          )}

                          {/* Imagem na operação*/}
                          <div className={styles.eventoImagem}>
                            <Image
                              src={getImagemPorCodVerba(evento.codVerba)}
                              alt="logo"
                              width={30}
                              height={30}
                              style={{ borderRadius: "50%" }}
                            />

                            <span style={{ fontSize: "8px" }}>
                              {evento?.nomeDiretoria || "Unidade"}
                            </span>
                          </div>

                          {/* Texto à direita */}
                          <div style={{ flex: 1 }}>
                            <div className={styles.eventoTextoADireita}>
                              {evento.nomeOme || "Unidade"} <br></br>
                              {evento.nomeEvento}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "left",
                                alignItems: "center",
                                fontSize: "11px",
                                color: "#6e6e6e",
                              }}
                            >
                              <span style={{ paddingRight: "20px" }}>
                                Oficiais: {evento.ttCtOfEvento} |{" "}
                                {evento.somaCotaOfEscala}
                              </span>
                              <span style={{ paddingRight: "20px" }}>
                                Praças: {evento.ttCtPrcEvento} |{" "}
                                {evento.somaCotaPrcEscala}
                              </span>
                              <FaUserSlash
                                color="orange"
                                style={{ marginRight: "5px" }}
                              />
                              {evento.totalImpedidos}
                            </div>
                          </div>
                          <div style={{ fontSize: "20px", paddingTop: "5px" }}>
                            <div
                              style={{
                                fontSize: "20px",
                                paddingBottom: "5px",
                                marginRight: "33px",
                              }}
                            >
                              {evento.statusEvento === "AUTORIZADA" ? (
                                <FaLockOpen color="green" />
                              ) : evento.statusEvento === "HOMOLOGADA" ? (
                                <FaLock color="red" />
                              ) : null}
                            </div>

                            <div style={{ fontSize: "18px" }}>
                              {evento.regularOuAtrasado === "ATRASADO" ? (
                                <FaClock color="#e207e2" />
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {mostrarOperacao && (
              <div className={styles.operacaoPrincipal}>
                <div className={styles.operacaoTitulo}>
                  <h3>OPERAÇÕES</h3>
                </div>
                <div className={styles.operacaoNomePrincipal}>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className={styles.operacaoInputBuscar}
                  />

                  <div
                    className={styles.operacaoCadastrar}
                    onClick={() => {
                      if (!selectedEventoId) {
                        alert("Selecione um Evento primeiro.");
                        return;
                      }

                      setModalDataOperacao({
                        pjesEventoId: selectedEventoId,
                        omeId: eventoSelecionadoObj?.omeId ?? "",
                        mes: mesNum,
                        ano: Number(ano),
                        userId: userId,
                        statusOperacao: "AUTORIZADA", // ou outro default
                      });
                      setMostrarModalOperacao(true);
                    }}
                  >
                    <div>
                      <FaPlus color="#4400ff" />
                    </div>
                  </div>
                </div>
                <ul>
                  {operacaoSelecionada.map((op) => {
                    const eventoPai = eventos.find(
                      (e) => e.id === selectedEventoId
                    );
                    console.log("Dados da Operação mapeada:", op);
                    const escalaDaOperacao = op.pjesescalas ?? [];
                    const isAberto = selectedOperacaoId === op.id;

                    return (
                      <li key={op.id} className={styles.operacaoImagemLi}>
                        <div className={styles.operacaoImagem}>
                          <Image
                            src={getImagemPorCodVerba(op.codVerba)}
                            alt="logo"
                            width={30}
                            height={30}
                            className={styles.operacaoImagemReal}
                          />

                          <div className={styles.operacaoBotaoAddPms}>
                            <button
                              disabled={!isAberto}
                              onClick={() => {
                                setModalDataEscala({
                                  pjesOperacaoId: op.id,
                                  mes: mesNum,
                                  ano: Number(ano),
                                  userId: userId,
                                  statusEscala: "AUTORIZADA",
                                });
                                setMostrarModalEscala(true);
                              }}
                              className={styles.operacaoBotaoAddPmsReal}
                              style={{
                                cursor: isAberto ? "pointer" : "not-allowed",
                                opacity: isAberto ? 1 : 0.3,
                              }}
                            >
                              ADICIONAR POLICIAIS
                            </button>
                            {/* Editar operação */}
                            <button
                              disabled={!isAberto}
                              onClick={() => {
                                setModalDataOperacao(op); // 👉 Abre o modal com os dados da operação
                                setMostrarModalOperacao(true);
                              }}
                              className={styles.operacaoBotaoEditarPmsReal}
                              style={{
                                cursor: isAberto ? "pointer" : "not-allowed",
                                opacity: isAberto ? 1 : 0.3,
                                paddingLeft: "10px",
                                paddingRight: "10px",
                              }}
                            >
                              <FaEdit />
                            </button>

                            {/* Excluir operação */}
                            <button
                              disabled={!isAberto}
                              onClick={() => handleExcluirOperacao(op.id)}
                              className={styles.operacaoBotaoExcluirPmsReal}
                              style={{
                                cursor: isAberto ? "pointer" : "not-allowed",
                                opacity: isAberto ? 1 : 0.3,
                                paddingLeft: "10px",
                                paddingRight: "10px",
                              }}
                            >
                              <FaTrash />
                            </button>

                            <button
                              disabled={!isAberto}
                              onClick={() => {
                                setModalDataEscala({
                                  pjesOperacaoId: op.id,
                                  mes: mesNum,
                                  ano: Number(ano),
                                  userId: userId,
                                  statusEscala: "AUTORIZADA",
                                });
                                setMostrarModalEscala(true);
                              }}
                              className={styles.operacaoBotaoPdfPmsReal}
                              style={{
                                cursor: isAberto ? "pointer" : "not-allowed",
                                opacity: isAberto ? 1 : 0.3,
                                paddingLeft: "10px",
                                paddingRight: "10px",
                              }}
                            >
                              <FaFilePdf />
                            </button>
                            <button
                              disabled={!isAberto}
                              onClick={() => {
                                setModalDataEscala({
                                  pjesOperacaoId: op.id,
                                  mes: mesNum,
                                  ano: Number(ano),
                                  userId: userId,
                                  statusEscala: "AUTORIZADA",
                                });
                                setMostrarModalEscala(true);
                              }}
                              className={styles.operacaoBotaoBaixarPmsReal}
                              style={{
                                cursor: isAberto ? "pointer" : "not-allowed",
                                opacity: isAberto ? 1 : 0.3,
                                paddingLeft: "10px",
                                paddingRight: "10px",
                              }}
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>

                        <div className={styles.operacaoNomeTabela}>
                          <div
                            onClick={() => handleOperacaoClick(op.id)}
                            className={styles.operacaoNomeClickTabela}
                            style={{
                              fontWeight: isAberto ? "bold" : "normal",
                              background: isAberto ? "#2a6fa8" : "#7d7e80",
                            }}
                          >
                            <div style={{ flex: 2 }}>
                              {eventoPai?.nomeOme || "Unidade"} |{" "}
                              {op.nomeOperacao}
                            </div>

                            <div className={styles.operacaoIconOfPrc}>
                              <FaStar /> {op.ttCtOfOper} | {op.ttCtOfExeOper}
                            </div>

                            <div className={styles.operacaoIconOfPrc}>
                              <FaForward /> {op.ttCtPrcOper} |{" "}
                              {op.ttCtPrcExeOper}
                            </div>
                          </div>
                        </div>

                        {isAberto &&
                          escalaDaOperacao.length > 0 &&
                          (() => {
                            const termo = busca.toLowerCase();

                            const escalasFiltradas =
                              escalasFiltradasPorOperacao[op.id] ?? [];

                            const totalPaginas = Math.ceil(
                              escalasFiltradas.length / escalasPorPagina
                            );
                            const escalasPaginadas = escalasFiltradas.slice(
                              (paginaAtual - 1) * escalasPorPagina,
                              paginaAtual * escalasPorPagina
                            );

                            return (
                              <div
                                style={{
                                  paddingLeft: "10px",
                                  paddingRight: "10px",
                                }}
                              >
                                <table
                                  className={styles["tabela-zebra"]}
                                  style={{
                                    width: "100%",
                                    fontSize: "12px",
                                    borderCollapse: "collapse",
                                    borderBottom: "2px solid black",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        background: "#0d5997",
                                        color: "white",
                                      }}
                                    >
                                      <th className={styles.operacaoTableTh}>
                                        Identificação do Policial
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Data e Hora do Serviço
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Local Apresentação
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Telefone
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Função
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Situação
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        <FaCheckSquare />
                                      </th>
                                      <th className={styles.operacaoTableTh}>
                                        Ações
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {escalasPaginadas.map((escala: any) => {
                                      const mat = escala.matSgp?.toString();

                                      return (
                                        <tr key={escala.id}>
                                          <td>
                                            {" "}
                                            {escala.pgSgp} {escala.matSgp}{" "}
                                            {escala.nomeGuerraSgp}{" "}
                                            {escala.omeSgp}
                                          </td>
                                          <td style={{ textAlign: "center" }}>
                                            {formatarDataISOParaBR(
                                              escala.dataInicio
                                            )}{" "}
                                            {escala.horaInicio} às{" "}
                                            {escala.horaFinal}
                                          </td>
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            {escala.localApresentacaoSgp}
                                          </td>
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            {" "}
                                            {escala.phone}
                                          </td>
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            {" "}
                                            {escala.funcao}
                                          </td>
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            {" "}
                                            {escala.situacaoSgp}
                                          </td>
                                          <td style={{ textAlign: "center" }}>
                                            <div
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: "5px",
                                                cursor: "pointer",
                                              }}
                                              title="Clique para homologar/desfazer"
                                              onClick={() =>
                                                toggleStatusEscala(escala)
                                              }
                                            >
                                              {escala.statusEscala ===
                                              "HOMOLOGADA" ? (
                                                <FaCheckSquare color="green" />
                                              ) : (
                                                <FaRegSquare />
                                              )}
                                            </div>
                                          </td>
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "inline-flex", // Permite que o conteúdo seja tratado como inline
                                                alignItems: "center", // Alinha verticalmente os ícones/texto
                                                padding: "5px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  marginRight: "5px",
                                                  padding: "2px",
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  handleDelete(escala.id)
                                                }
                                                title="Excluir escala"
                                              >
                                                <FaTrash color="red" />
                                              </div>

                                              <div
                                                style={{
                                                  marginRight: "5px",
                                                  padding: "2px",
                                                  cursor: "pointer",
                                                }}
                                                title="Adicionar observação"
                                                onClick={() =>
                                                  handleAbrirObs(escala)
                                                }
                                              >
                                                <FaComment
                                                  color={
                                                    escala.obs
                                                      ? "#007bff"
                                                      : "#888"
                                                  }
                                                />
                                              </div>

                                              <div>
                                                <div>
                                                  <div>
                                                    (
                                                    {cotasPorMatricula[mat] ??
                                                      0}
                                                    )
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>

                                <div
                                  className={styles.operacaoPaginacaoPrinciapl}
                                >
                                  <button
                                    onClick={() =>
                                      setPaginaAtual((prev) =>
                                        Math.max(prev - 1, 1)
                                      )
                                    }
                                    disabled={paginaAtual === 1}
                                    className={styles.operacaoPaginacaoAnterior}
                                  >
                                    Anterior
                                  </button>
                                  <span>
                                    Página {paginaAtual} de {totalPaginas}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setPaginaAtual((prev) =>
                                        Math.min(prev + 1, totalPaginas)
                                      )
                                    }
                                    disabled={paginaAtual === totalPaginas}
                                    className={styles.operacaoPaginacaoProxima}
                                  >
                                    Próxima
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <DistribuicaoModal
            isOpen={mostrarModal}
            onClose={() => {
              setMostrarModal(false);
              setModalData(null);
            }}
            onSubmit={async (dados) => {
              const isEdit = Boolean(dados.id);
              const url = isEdit
                ? `/api/pjesdist/${dados.id}`
                : "/api/pjesdist";
              const method = isEdit ? "PUT" : "POST";

              try {
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(dados),
                });

                const result = await res.json();

                if (!res.ok) {
                  alert(result.error || "Erro ao salvar distribuição.");
                  return; // não fecha o modal
                }

                if (isEdit) {
                  setPjesdists((prev) =>
                    prev.map((d) => (d.id === result.id ? result : d))
                  );
                } else {
                  setPjesdists((prev) => [...prev, result]);
                }

                // ✅ Fecha o modal só se deu certo
                setMostrarModal(false);
                setModalData(null);
              } catch (error) {
                console.error("Erro ao salvar distribuição:", error);
                alert("Erro interno ao salvar distribuição.");
              }
            }}
            tetos={pjestetos}
            selectedTetoId={selectedTetoId}
            mes={mesNum}
            ano={Number(ano)}
            userId={userId}
            initialData={modalData}
          />

          <EventoModal
            isOpen={mostrarModalEvento}
            onClose={() => {
              setMostrarModalEvento(false);
              setModalDataEvento(null);
            }}
            onSubmit={async (dados) => {
              const isEdit = Boolean(dados.id);

              const params = new URLSearchParams({
                ano: String(ano),
                mes: String(mesNum),
              });

              const url = isEdit
                ? `/api/pjesevento/${dados.id}?${params.toString()}`
                : `/api/pjesevento?${params.toString()}`;

              const method = isEdit ? "PUT" : "POST";

              try {
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(dados),
                });

                const text = await res.text();
                let result;

                try {
                  result = JSON.parse(text);
                } catch {
                  console.error("Resposta não é JSON válido:", text);
                  alert("Erro inesperado ao salvar evento.");
                  return false;
                }

                if (!res.ok) {
                  alert(result?.error || "Erro ao salvar evento.");
                  return false;
                }

                // ✅ Fecha o modal
                setMostrarModalEvento(false);
                setModalDataEvento(null);
                atualizarDados();
                return true;
              } catch (error) {
                console.error("Erro ao salvar evento:", error);
                alert("Erro interno ao salvar evento.");
                return false;
              }
            }}
            mes={mesNum}
            ano={Number(ano)}
            userId={userId}
            initialData={modalDataEvento}
            dists={pjesdists}
            selectedDistId={selectedDistId}
          />

          <OperacaoModal
            isOpen={mostrarModalOperacao}
            onClose={() => {
              setMostrarModalOperacao(false);
              setModalDataOperacao(null);
            }}
            onSubmit={async (dados) => {
              const isEdit = Boolean(dados.id);

              const params = new URLSearchParams({
                ano: String(ano),
                mes: String(mesNum),
              });

              const url = isEdit
                ? `/api/pjesoperacao/${dados.id}?${params.toString()}`
                : `/api/pjesoperacao?${params.toString()}`;

              const method = isEdit ? "PUT" : "POST";

              try {
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(dados),
                });

                const text = await res.text();
                let result;

                try {
                  result = JSON.parse(text);
                } catch {
                  console.error("Resposta não é JSON válido:", text);
                  alert("Erro inesperado ao salvar Operacao.");
                  return false;
                }

                if (!res.ok) {
                  alert(result?.error || "Erro ao salvar Operacao.");
                  return false;
                }

                // ✅ Fecha o modal
                setMostrarModalOperacao(false);
                setModalDataOperacao(null);

                atualizarDados();

                return true;
              } catch (error) {
                console.error("Erro ao salvar Operacao:", error);
                alert("Erro interno ao salvar Operacao.");
                return false;
              }
            }}
            mes={mesNum}
            ano={Number(ano)}
            userId={userId}
            initialData={modalDataOperacao}
            eventos={eventos}
            selectedEventoId={selectedEventoId}
          />

          <EscalaModal
            isOpen={mostrarModalEscala}
            onClose={() => {
              setMostrarModalEscala(false);
              setModalDataEscala(null);
              atualizarDados(); // ainda útil para refetch se quiser
            }}
            onSuccess={async () => {
              // ❌ NÃO precisa de setPjesoperacoes aqui
              setMostrarModalEscala(false);
              setModalDataEscala(null);
            }}
            onSubmit={salvarOuAtualizarEscala}
            mes={mesNum}
            ano={Number(ano)}
            userId={userId}
            initialData={modalDataEscala}
            operacoes={
              eventos.find((ev) => ev.id === selectedEventoId)?.operacoes ?? []
            }
            selectedOperacaoId={selectedOperacaoId}
            omeId={eventoSelecionadoObj?.omeId ?? 0}
            pjesEventoId={selectedEventoId ?? 0}
          />

          <ObsModal
            isOpen={mostrarModalObs}
            onClose={() => {
              setMostrarModalObs(false);
              setModalDataObs(null);
            }}
            initialData={modalDataObs}
            onSubmit={async (dados) => {
              try {
                const id = dados.id || dados.escalaId;

                const res = await fetch(`/api/pjesescala/${id}/obs`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ obs: dados.obs }),
                });

                const text = await res.text();
                const result = text ? JSON.parse(text) : null;

                if (!res.ok) {
                  alert(result?.error || "Erro ao salvar observação.");
                  return false;
                }

                // ✅ Atualize o modal com os dados novos + preserve userObs
                setModalDataObs((prev) => ({
                  ...prev,
                  obs: result.obs,
                  updatedObsAt: result.updatedObsAt,
                  userObs: result.userObs?.ome ? result.userObs : prev?.userObs, // fallback
                }));

                atualizarDados();

                return true;
              } catch (error) {
                console.error("Erro ao salvar observação:", error);
                alert("Erro interno ao salvar observação.");
                return false;
              }
            }}
          />

          <PrestacaoContasModal
            isOpen={mostrarModalPrestacaoContas}
            onClose={() => setMostrarModalPrestacaoContas(false)}
            onSubmit={async (regularOuAtrasado) => {
              setMostrarModalPrestacaoContas(false);

              const query = new URLSearchParams({
                ano: String(ano),
                mes: mesNum.toString(),
                regularOuAtrasado,
              });

              try {
                const res = await fetch(
                  `/api/pjesescala/excel?${query.toString()}`
                );
                if (!res.ok) {
                  alert("Erro ao baixar o Excel.");
                  return;
                }

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);

                const nomeMes = (mes: number) => {
                  const nomes = [
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
                  return nomes[mes - 1] ?? "";
                };

                // ⬇️ Sanitize nome da OME
                const rawNomeOme = user?.ome?.nomeOme ?? "OME";
                const nomeSanitizado = removerCaracteresEspeciais(rawNomeOme);
                const nomeMesAbreviado = nomeMes(mesNum);
                const nomeArquivo = `GENESIS_PJES_${nomeSanitizado}_${nomeMesAbreviado}_${ano}.xlsx`;

                // ⬇️ Cria link para download
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", nomeArquivo);
                document.body.appendChild(link);
                link.click();
                link.remove();

                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Erro ao baixar Excel:", err);
                alert("Erro ao baixar Excel.");
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
