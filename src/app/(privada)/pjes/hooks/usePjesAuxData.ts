import { useState, useEffect } from "react";

interface Teto {
  codVerba: string;
  imagemUrl: string;
  nomeVerba: string;
  id: number;
}

interface Operacao {
  id: number;
  nomeOperacao: string;
  codVerba: string;
  omeId: number;
  pjesEventoId: number;
  ttCtOfOper: number;
  ttCtPrcOper: number;
  ttCtOfExeOper: number;
  ttCtPrcExeOper: number;
  userId: number;
  statusOperacao: string;
  mes: number;
  ano: number;
  codOp: string;
  createdAt: string;
  updatedAt: string;
  nomeOme: string;
}

export interface Evento {
  id: number;
  pjesDistId: number;
  omeId: number;
  codVerba: string;
  nomeEvento: string;
  nomeOme: string;
  statusEvento: string;
  ttCtOfEvento: number;
  ttCtPrcEvento: number;
  nomeDiretoria: string;
  pjesoperacoes: Operacao[]; // <-- isso já estava correto
}

interface Distribuicao {
  // Adicione se precisar
}

export function usePjesAuxData(ano: number | null, mes: number | null, omeId: number | null) {
  const [tetos, setTetos] = useState<Teto[]>([]);
  const [tetoSelecionado, setTetoSelecionado] = useState<Teto | null>(null);
  const [distribuicoes, setDistribuicoes] = useState<Distribuicao[]>([]);
  const [eventosOme, setEventosOme] = useState<{ nomeOme: string; eventos: Evento[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega os tetos
  useEffect(() => {
    async function fetchTetos() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pjesteto?ano=${ano}&mes=${mes}`);
        if (!res.ok) throw new Error("Erro ao buscar tetos");
        const data = await res.json();
        setTetos(data);
        setTetoSelecionado(data[0] || null);

      } catch (e) {
        console.error(e);
        setTetos([]);
        setTetoSelecionado(null);
      } finally {
        setLoading(false);
      }
    }

    if (ano && mes) {
      fetchTetos();
    }
  }, [ano, mes]);

  // Atualiza os eventos quando o tetoSelecionado mudar
  useEffect(() => {
    if (tetoSelecionado && ano && mes) {
      fetchEventos(tetoSelecionado.codVerba);
    } else {
      setEventosOme(null);
    }
  }, [tetoSelecionado, ano, mes]);

  async function fetchEventos(codVerba: string) {
    if (!ano || !mes || !codVerba) {
      console.warn("Parâmetros inválidos para buscar eventos:", { ano, mes, codVerba });
      return;
    }

    try {
      setLoading(true);

      // 1. Buscar eventos
      const eventosRes = await fetch(`/api/pjesevento?ano=${ano}&mes=${mes}&codVerba=${codVerba}`);
      if (!eventosRes.ok) throw new Error("Erro ao buscar eventos");
      const data = await eventosRes.json();

      // 2. Buscar TODAS as operações daquele mês/ano
      const operacoesRes = await fetch(`/api/pjesoperacao?ano=${ano}&mes=${mes}`);
      if (!operacoesRes.ok) throw new Error("Erro ao buscar operações");
      const operacoes = await operacoesRes.json();
 
     // 3. Associar operações aos seus eventos
      const eventosComOperacoes: Evento[] = data.eventos.map((evento: Evento) => {
        const operacoesDoEvento = operacoes.filter(
          (op: Operacao) => op.pjesEventoId === evento.id
        );
        return {
          ...evento,
          pjesoperacoes: operacoesDoEvento,
        };
      });

      setEventosOme({
        nomeOme: data.nomeOme ?? "OME não identificada",
        eventos: eventosComOperacoes,
      });
    } catch (e) {
      console.error("Erro ao buscar eventos da OME:", e);
      setEventosOme(null);
    } finally {
      setLoading(false);
    }
  }

  function handleTetoClick(tetoId: number) {
    const teto = tetos.find((t) => t.id === tetoId);
    if (!teto) return;
    setTetoSelecionado(teto);
  }

  async function refreshEventos() {
    if (tetoSelecionado && ano && mes) {
      await fetchEventos(tetoSelecionado.codVerba);
    }
  }

  return {
    tetos,
    tetoSelecionado,
    eventosOme,
    handleTetoClick,
    loading,
    refreshEventos,
  };
}
