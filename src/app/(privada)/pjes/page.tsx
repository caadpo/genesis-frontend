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
  ChartOptions,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Resumo {
  somattCtOfEvento: number;
  somattCotaOfEscala: number;
  somattCtPrcEvento: number;
  somattCotaPrcEscala: number;
  valorTtPlanejado: number;
  valorTtExecutado: number;
  saldoFinal: number;
}

interface Evento {
  ttCtOfEvento?: number;
  somaCotaOfEscala?: number;
  ttCtPrcEvento?: number;
  somaCotaPrcEscala?: number;
  valorTtPlanejado?: number;
  valorTtExecutado?: number;
  saldoFinal?: number;
  [key: string]: any;
}

export interface PjesOperacao {
  id: number;
  nomeOperacao: string;
  codVerba: number;
  omeId: number;
  pjesEventoId: number;
  ttCtOfOper: number;
  ttCtPrcOper: number;
  userId: number;
  statusOperacao: string;
  mes: number;
  ano: number;
  codOp: string;
  createdAt: string;
  updatedAt: string;
  pjesevento?: {
    id: number;
    nomeEvento: string;
  };
  pjesescalas?: Escala[];
  nomeOme?: string;
  ttCtOfExeOper: number;
  ttCtPrcExeOper: number;
}

interface Escala {
  nomeGuerraSgp?: string;
  nomeCompletoSgp?: string;
  pgSgp?: string;
  matSgp?: string | number;
  phone?: string | number;
  localApresentacaoSgp?: string;
  statusEscala?: string;
  dataInicio: string | Date;
}

interface ModalDataObsType {
  obs: string;
  updatedObsAt: string;
  userObs?: {
    ome?: any;
  };
}

type UsuarioParcial = {
  pg?: string;
  nomeGuerra: string;
  nomeOme: string;
  imagemUrl?: string;
};

type InitialDataObs = {
  id?: number;
  userObs?: UsuarioParcial;
  [key: string]: any;
};


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
  const [modalDataObs, setModalDataObs] = useState<InitialDataObs | null>(null);

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

  const { eventos, tetos, dists, loading, atualizarOperacao } = useCarregarDadosPjes(
    ano,
    mesNum,
    pjesevento
  ) as {
    eventos: EventoComOperacoes[];
    tetos: any[];
    dists: any[];
    loading: boolean;
    atualizarOperacao: (
      operacaoIdAtualizada: number,
      novosCampos: Partial<PjesOperacao>
    ) => void;
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

  //INICIO  DA TABELA RESUMO
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
          console.error("Erro ao buscar resumo na tela pjes:", data.error);
          return null;
        } catch (error) {
          console.error("Erro de rede:", error);
          return null;
        }
      };

      setResumoDim(await fetchResumo(anoNum, mesFinal, 2, 15));
      setResumoDiresp(await fetchResumo(anoNum, mesFinal, 16, 30));
      setResumoDinteri(await fetchResumo(anoNum, mesFinal, 31, 46));
      setResumoDinterii(await fetchResumo(anoNum, mesFinal, 47, 58));
      setResumoDpo(await fetchResumo(anoNum, mesFinal, 1, 107));
    };

    carregarResumos();
  }, [ano, mesNum]);

  //VARAIVEL PARA PODER ALTERNAR ENTRE VERBA PMPE E CONVENIOS
  const [abaAtiva, setAbaAtiva] = useState<"diretorias" | "convenios">(
    "diretorias"
  );
  const eventosVerba247 = pjeseventos.filter((e) => e.codVerba === 247);
  const eventosVerba255 = pjeseventos.filter((e) => e.codVerba === 255);
  const eventosVerba263 = pjeseventos.filter((e) => e.codVerba === 263);
  const eventosVerba250 = pjeseventos.filter((e) => e.codVerba === 250);
  const eventosVerba252 = pjeseventos.filter((e) => e.codVerba === 252);
  const eventosVerba253 = pjeseventos.filter((e) => e.codVerba === 253);
  const eventosVerba260 = pjeseventos.filter((e) => e.codVerba === 260);
  const eventosVerba257 = pjeseventos.filter((e) => e.codVerba === 257);
  const eventosVerba251 = pjeseventos.filter((e) => e.codVerba === 251);
  const eventosVerba266 = pjeseventos.filter((e) => e.codVerba === 266);
  const gerarResumoFiltrado = (eventosFiltrados: Evento[]): Resumo => {
    return eventosFiltrados.reduce<Resumo>(
      (acc, evento) => {
        acc.somattCtOfEvento += evento.ttCtOfEvento || 0;
        acc.somattCotaOfEscala += evento.somaCotaOfEscala || 0;
        acc.somattCtPrcEvento += evento.ttCtPrcEvento || 0;
        acc.somattCotaPrcEscala += evento.somaCotaPrcEscala || 0;
        acc.valorTtPlanejado += evento.valorTtPlanejado || 0;
        acc.valorTtExecutado += evento.valorTtExecutado || 0;
        acc.saldoFinal += evento.saldoFinal || 0;
        return acc;
      },
      {
        somattCtOfEvento: 0,
        somattCotaOfEscala: 0,
        somattCtPrcEvento: 0,
        somattCotaPrcEscala: 0,
        valorTtPlanejado: 0,
        valorTtExecutado: 0,
        saldoFinal: 0,
      }
    );
  };

  const eventosDim247 = eventosVerba247
    .filter((e) => e.omeId >= 2 && e.omeId <= 15)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDim247 = gerarResumoFiltrado(eventosDim247);

  // Eventos da verba 247 na DIRESP
  const eventosDiresp247 = eventosVerba247
    .filter((e) => e.omeId >= 16 && e.omeId <= 30)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDiresp247 = gerarResumoFiltrado(eventosDiresp247);

  // Eventos da verba 247 na DINTER I
  const eventosDinteri247 = eventosVerba247
    .filter((e) => e.omeId >= 31 && e.omeId <= 46)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDinteri247 = gerarResumoFiltrado(eventosDinteri247);

  // Eventos da verba 247 na DINTER II
  const eventosDinterii247 = eventosVerba247
    .filter((e) => e.omeId >= 47 && e.omeId <= 58)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDinterii247 = gerarResumoFiltrado(eventosDinterii247);

  // Eventos da verba 247 na DPO
  const eventosDpo247 = eventosVerba247
    .filter((e) => e.omeId >= 59 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDpo247 = gerarResumoFiltrado(eventosDpo247);

  // Eventos da verba 255 na TI
  const eventosDpo255 = eventosVerba255
    .filter((e) => e.omeId >= 1 && e.omeId <= 74)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoDpo255 = gerarResumoFiltrado(eventosDpo255);

  // Eventos da verba 263 na PE
  const eventosPe263 = eventosVerba263
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoPe263 = gerarResumoFiltrado(eventosPe263);

  // Eventos da verba 250 na Federal
  const eventosFederal250 = eventosVerba250
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoFederal250 = gerarResumoFiltrado(eventosFederal250);

  // Eventos da verba 252 na TJPE
  const eventosTjpe252 = eventosVerba252
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoTjpe252 = gerarResumoFiltrado(eventosTjpe252);

  // Eventos da verba 253 na MPPE
  const eventosMppe253 = eventosVerba253
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoMppe253 = gerarResumoFiltrado(eventosMppe253);

  // Eventos da verba 260 na CAMIL
  const eventosCamil260 = eventosVerba260
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoCamil260 = gerarResumoFiltrado(eventosCamil260);

  // Eventos da verba 257 na CPRH
  const eventosCprh257 = eventosVerba257
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoCprh257 = gerarResumoFiltrado(eventosCprh257);

  // Eventos da verba 251 na Alepe
  const eventosAlepe251 = eventosVerba251
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoAlepe251 = gerarResumoFiltrado(eventosAlepe251);

  // Eventos da verba 266 na TCE
  const eventosTce266 = eventosVerba266
    .filter((e) => e.omeId >= 1 && e.omeId <= 107)
    .sort((a, b) => a.omeId - b.omeId);
  const resumoTce266 = gerarResumoFiltrado(eventosTce266);

  //FIM  DA TABELA RESUMO

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
    return evento?.pjesoperacoes || [];
  }, [eventos, selectedEventoId]);

  const escalasFiltradasPorOperacao = useMemo(() => {
    const resultado: Record<number, Escala[]> = {};
    const termo = busca.toLowerCase();

    operacaoSelecionada.forEach((op: PjesOperacao) => {
      const escalas: Escala[] = op.pjesescalas || [];

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

  async function homologarEventos(mes: number, ano: number) {
    const confirmar = window.confirm("Deseja Homologar todos Eventos?");
    if (!confirmar) return;

    try {
      const res = await fetch(
        `/api/pjesevento/homologar?mes=${mes}&ano=${ano}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(
          "Usuario sem permissão. Apenas Usuario Tecnico ou Auxiliar: " +
            (data.error || res.statusText)
        );
        return;
      }
      atualizarDados();
      alert("Eventos homologados com sucesso!");
    } catch (error) {
      alert("Erro interno ao homologar eventos.");
      console.error(error);
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
        (ev) => ev.pjesoperacoes?.flatMap((op: PjesOperacao) => op.pjesescalas || []) || []
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

  const chartOptions: ChartOptions<"bar"> = {
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
        position: "right",
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
        } as any, // 👈 força a aceitação
      }
    },
  };

  // FIM CONG DO GRAFICO

  const handleAbrirObs = (escala: any) => {
    setModalDataObs({
      ...escala,
      userObs: user,
    });
    setMostrarModalObs(true);
  };
  // Função para remover acentos e caracteres especiais e trocar espaços por _
  function removerCaracteresEspeciais(str: string): string {
    return str
      .replace(/[^ -~]+/g, "") // remove todos os caracteres não ASCII visíveis (como º, ª, Â)
      .normalize("NFD") // normaliza acentos
      .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
      .replace(/[^a-zA-Z0-9\s]/g, "") // remove outros símbolos especiais
      .replace(/\s+/g, "_"); // substitui espaços por _
  }

  //Codigo para ocultar botoes quando oevento estiver HOMOLOGADO
  const isRestrito =
    eventoSelecionadoObj?.statusEvento === "HOMOLOGADA" &&
    user?.typeUser !== 5 &&
    user?.typeUser !== 10;

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
                        width={selectedTetoId === teto.id ? 60 : 45}
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
                {/* INICIO DIV DISTRIBUIÇÃO*/}
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
                  <div className={styles.tabelaWrapper}>
                    <table className={styles.tableDist}>
                      <thead>
                        <tr className={styles.theadPrincipal}>
                          <th colSpan={2} className={styles.thPadrao}>
                            Diretoria
                          </th>
                          <th className={styles.thPadrao}>Distribuição</th>
                          <th className={styles.thPadrao}>Oficiais</th>
                          <th className={styles.thPadrao}>Praças</th>
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

                            <td className={styles.tdPadrao}>
                              {dist.ttCtOfDist} | {dist.ttCotaOfEscala} ------
                              Não Exe: {dist.ttCotaOfSaldo}
                            </td>
                          
                            <td className={styles.tdPadrao}>
                              {dist.ttCtPrcDist} | {dist.ttCotaPrcEscala} ------
                              Não Exe: {dist.ttCotaPrcSaldo}
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
                                              prev.filter(
                                                (d) => d.id !== dist.id
                                              )
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
                </div>
                {/* FIM DIV DISTRIBUIÇÃO*/}

                {/* INICIO DIV INSIDES */}
                <div className={styles.containerInsides}>
                  <h3>
                    <strong>BANCO DE COTAS</strong>
                  </h3>

                  <div className={styles.boxResumo}>
                    {/* BLOCO 1 */}
                    <div
                      className={`${styles.blocoResumo} ${styles.blocoComSeparador}`}
                    >
                      <FaStar size={28} color="#008cff" />
                      <div className={styles.valorResumo}>
                        {selectedDist?.ttOfDistMenosEvento ?? "--"}
                      </div>
                      <div>Oficiais</div>
                    </div>

                    {/* BLOCO 2 */}
                    <div className={styles.blocoResumo}>
                      <FaAngleDoubleUp size={28} color="#6ab90f" />
                      <div className={styles.valorResumo}>
                        {selectedDist?.ttPrcDistMenosEvento ?? "--"}
                      </div>
                      <div>Praças</div>
                    </div>
                  </div>
                </div>
                {/* FIM DIV INSIDES */}

                {/* INICIO DIV INSIDES */}
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
                {/* FIM DIV INSIDES */}

                {/* INICIO DIV GRAFICO */}
                <div className={styles.containerGrafico}>
                  <h3>
                    <strong>GRÁFICO</strong>
                  </h3>
                  <div className={styles.boxGrafico}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
                {/* FIM DIV GRAFICO */}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flex: 1 }}>
            {/* INICIO TABELA DE CONSUMO E EXECUÇÃO DAS DIRETORIAS POR OME */}
            <div className={styles.larguraDiretoria}>
              <div className={styles.abasContainer}>
                <button
                  className={
                    abaAtiva === "diretorias" ? styles.abaAtiva : styles.aba
                  }
                  onClick={() => setAbaAtiva("diretorias")}
                >
                  DIRETORIAS
                </button>
                <button
                  className={
                    abaAtiva === "convenios" ? styles.abaAtiva : styles.aba
                  }
                  onClick={() => setAbaAtiva("convenios")}
                >
                  CONVÊNIOS PMPE
                </button>
              </div>
              {/* Conteúdo da aba "DIRETORIAS" */}
              {abaAtiva === "diretorias" && (
                <>
                  <div className={styles.tituloDiretoria}>
                    <h3>DIRETORIAS</h3>
                  </div>

                  {/* VERBA 247 - DPO */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/dpo_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDpo && (
                    <TabelaResumoPorDiretoria
                      titulo="DPO"
                      resumo={resumoDpo247}
                      omeMin={61}
                      omeMax={104}
                      eventos={eventosDpo247}
                    />
                  )}

                  {/* VERBA 247 - DIM */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/dpo_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDim && (
                    <TabelaResumoPorDiretoria
                      titulo="DIM"
                      resumo={resumoDim247}
                      omeMin={2}
                      omeMax={15}
                      eventos={eventosDim247}
                    />
                  )}

                  {/* VERBA 247 - DIRESP */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/dpo_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDiresp && (
                    <TabelaResumoPorDiretoria
                      titulo="DIRESP"
                      resumo={resumoDiresp247}
                      omeMin={16}
                      omeMax={32}
                      eventos={eventosDiresp247}
                    />
                  )}

                  {/* VERBA 247 - DINTER I */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/dpo_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDinteri && (
                    <TabelaResumoPorDiretoria
                      titulo="DINTER I"
                      resumo={resumoDinteri247}
                      omeMin={33}
                      omeMax={48}
                      eventos={eventosDinteri247}
                    />
                  )}

                  {/* VERBA 247 - DINTER II */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/dpo_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDinterii && (
                    <TabelaResumoPorDiretoria
                      titulo="DINTER II"
                      resumo={resumoDinterii247}
                      omeMin={49}
                      omeMax={60}
                      eventos={eventosDinterii247}
                    />
                  )}
                </>
              )}

              {/* Conteúdo da aba "CONVÊNIOS" */}
              {abaAtiva === "convenios" && (
                <>
                  <div className={styles.tituloDiretoria}>
                    <h3>CONVENIOS</h3>
                  </div>

                  {/* VERBA 255 - TI */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/mobi_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoDpo && (
                    <TabelaResumoPorDiretoria
                      titulo="MOBI-PE"
                      resumo={resumoDpo255}
                      omeMin={2}
                      omeMax={104}
                      eventos={eventosDpo255}
                    />
                  )}

                  {/* VERBA 263 - PE */}

                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/pe_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoPe263 && (
                    <TabelaResumoPorDiretoria
                      titulo="PATRULHA ESCOLAR"
                      resumo={resumoPe263}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosPe263}
                    />
                  )}

                  {/* VERBA 250 - FEDERAL */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/brasil_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoFederal250 && (
                    <TabelaResumoPorDiretoria
                      titulo="FEDERAL"
                      resumo={resumoFederal250}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosFederal250}
                    />
                  )}

                  {/* VERBA 252 - TJPE */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/tjpe_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoTjpe252 && (
                    <TabelaResumoPorDiretoria
                      titulo="TJPE"
                      resumo={resumoTjpe252}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosTjpe252}
                    />
                  )}

                  {/* VERBA 253 - MPPE */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/mppe_logo.jpg"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoMppe253 && (
                    <TabelaResumoPorDiretoria
                      titulo="MPPE"
                      resumo={resumoMppe253}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosMppe253}
                    />
                  )}

                  {/* VERBA 260 - CAMIL */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/camil_logo.jpg"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoCamil260 && (
                    <TabelaResumoPorDiretoria
                      titulo="CAMIL"
                      resumo={resumoCamil260}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosCamil260}
                    />
                  )}

                  {/* VERBA 257 - CPRH */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/cprh_logo.jpg"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoCprh257 && (
                    <TabelaResumoPorDiretoria
                      titulo="CPRH"
                      resumo={resumoCprh257}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosCprh257}
                    />
                  )}

                  {/* VERBA 251 - ALEPE */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/alepe_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoAlepe251 && (
                    <TabelaResumoPorDiretoria
                      titulo="ALEPE"
                      resumo={resumoAlepe251}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosAlepe251}
                    />
                  )}

                  {/* VERBA 266 - TCE */}
                  <Image
                    width={25}
                    height={25}
                    src={"/assets/images/tce_logo.png"}
                    alt="img_verba"
                    className={styles.imgResumoDiretorias}
                  />
                  {resumoTce266 && (
                    <TabelaResumoPorDiretoria
                      titulo="TCE"
                      resumo={resumoTce266}
                      omeMin={2}
                      omeMax={109}
                      eventos={eventosTce266}
                    />
                  )}
                </>
              )}
            </div>
            {/* FIM TABELA DE CONSUMO E EXECUÇÃO DAS DIRETORIAS POR OME */}

            {mostrarEvento && (
              <div className={styles.eventoPrincipal}>
                <div className={styles.eventoTitulo}>
                  <h3>EVENTOS</h3>
                </div>

                <div className={styles.eventoNomePrincipal}>
                  {/* inicio input de buscar eventos*/}
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={buscaEventos}
                    onChange={(e) => setBuscaEventos(e.target.value)}
                    className={styles.eventoInputBuscar}
                  />
                  {/* fim input de buscar eventos*/}

                  {!isRestrito && (
                    <>
                      {/* inicio botao add eventos*/}
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
                      {/* fim botao add eventos*/}

                      {/* inicio botao homologar todos eventos*/}
                      <div
                        className={styles.operacaoCadastrar}
                        onClick={() => homologarEventos(mesNum, Number(ano))}
                        title="Homologar todos eventos"
                        style={{ cursor: "pointer" }}
                      >
                        <FaLock color="#f40606" />
                      </div>
                      {/* fim botao homologar todos eventos*/}
                    </>
                  )}

                  {/* inicio botao prestar conta*/}
                  <div
                    className={styles.operacaoCadastrar}
                    onClick={() => setMostrarModalPrestacaoContas(true)}
                    title="Prestar Contas"
                  >
                    <FaDownload color="#1f9c00" />
                  </div>
                  {/* fim botao prestar conta*/}
                </div>

                    {eventoSelecionado.length === 0 ? (
                      <p>Nenhum evento para esta distribuição.</p>
                    ) : (
                      
                    <div style={{height:"2000px", overflow:"auto"}}>
                      <ul className={styles.eventoUl}>
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
                    </div>
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

                  {/* INICIO BOTAO DE ADIOCNAR OPERAÇÃO*/}
                  {!isRestrito && (
                    <>
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
                    </>
                  )}

                  {/* FIM BOTAO DE ADIOCNAR OPERAÇÃO*/}
                </div>
                <ul>
                  {operacaoSelecionada.map((op: PjesOperacao) => {
                    const eventoPai = eventos.find(
                      (e) => e.id === selectedEventoId
                    );
                    const escalaDaOperacao = op.pjesescalas ?? [];
                    const isAberto = selectedOperacaoId === op.id;

                    return (
                      <li key={op.id} className={styles.operacaoImagemLi}>
                        <div className={styles.operacaoImagem}>
                          <div
                            style={{
                              display: "flex",
                              alignContent: "center",
                              alignItems: "center",
                              fontSize: "14px",
                            }}
                          >
                            <Image
                              src={getImagemPorCodVerba(op.codVerba)}
                              alt="logo"
                              width={30}
                              height={30}
                              className={styles.operacaoImagemReal}
                            />

                            <span style={{ marginLeft: "15px" }}>
                              {" "}
                              <span style={{ color: "#777474" }}>
                                CODIGO DA OPERAÇÃO:
                              </span>
                              <strong> {op.codOp}</strong>{" "}
                            </span>
                          </div>

                          <div className={styles.operacaoBotaoAddPms}>
                            {!isRestrito && (
                              <>
                                {/* botao add policiais */}
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
                                    cursor: isAberto
                                      ? "pointer"
                                      : "not-allowed",
                                    opacity: isAberto ? 1 : 0.3,
                                  }}
                                >
                                  ADICIONAR POLICIAIS
                                </button>

                                {/* botao editar operação */}
                                <button
                                  disabled={!isAberto}
                                  onClick={() => {
                                    setModalDataOperacao(op);
                                    setMostrarModalOperacao(true);
                                  }}
                                  className={styles.operacaoBotaoEditarPmsReal}
                                  style={{
                                    cursor: isAberto
                                      ? "pointer"
                                      : "not-allowed",
                                    opacity: isAberto ? 1 : 0.3,
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                  }}
                                >
                                  <FaEdit />
                                </button>

                                {/* botao excluir operação */}
                                <button
                                  disabled={!isAberto}
                                  onClick={() => handleExcluirOperacao(op.id)}
                                  className={styles.operacaoBotaoExcluirPmsReal}
                                  style={{
                                    cursor: isAberto
                                      ? "pointer"
                                      : "not-allowed",
                                    opacity: isAberto ? 1 : 0.3,
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                  }}
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}

                            {/* inicio botao gerar pdf */}
                            <button
                              disabled={!isAberto}
                              onClick={() => {
                                // codOp que pode conter "/", separar em segmentos para a rota catch-all
                                const codOpPath = op.codOp
                                  .split("/")
                                  .map(encodeURIComponent)
                                  .join("/");

                                // abre a rota do Next.js que vai chamar sua API e baixar o PDF
                                window.open(
                                  `/api/pjesoperacao/pdf-codop/${codOpPath}?mes=${mesNum}&ano=${ano}`,
                                  "_blank"
                                );
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
                            {/* fim botao gerar pdf */}
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
                                    fontSize: "10px",
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
                                        Anotações( Ex: Vtr, O.S)
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
                                      console.log("Escala completa:", escala);

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
                                          <td
                                            style={{
                                              textAlign: "center",
                                            }}
                                          >
                                            {" "}
                                            {escala.anotacaoEscala}
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
                                                    escala.comentarios &&
                                                    escala.comentarios.length >
                                                      0
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

          {userId !== undefined && (
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

          )}
        

         {userId !== undefined && (
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
          )}


          {userId !== undefined && (
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
          )}


          {userId !== undefined && (
          <EscalaModal
            isOpen={mostrarModalEscala}
            onClose={() => {
              setMostrarModalEscala(false);
              setModalDataEscala(null);
              atualizarDados();
            }}
            onSuccess={async () => {
              setMostrarModalEscala(false);
              setModalDataEscala(null);
            }}
            onSubmit={salvarOuAtualizarEscala}
            mes={mesNum}
            ano={Number(ano)}
            userId={userId}
            initialData={modalDataEscala}
            operacoes={
              eventos.find((ev) => ev.id === selectedEventoId)?.pjesoperacoes ??
              []
            }
            selectedOperacaoId={selectedOperacaoId}
            omeId={eventoSelecionadoObj?.omeId ?? 0}
            pjesEventoId={selectedEventoId ?? 0}
          />
          )}

          {userId !== undefined && (
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

                const res = await fetch(`/api/pjesescala/${id}/comentario`, {
                  method: "POST",
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
          )}

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
