import { useState, useEffect } from "react";

interface Teto {
  codVerba: string;
  imagemUrl: string;
  nomeVerba: string;
  tetoOf: number;
  tetoPrc: number;
}

interface Distribuicao {
  id: number;
  diretoriaId: number;
  nomeVerba: string;
  nomeDiretoria: string;
  nomeDist: string;
  ttCtOfDist: number;
  ttCtPrcDist: number;
  codVerba: string;
  ttOfDistMenosEvento: number;
  ttPrcDistMenosEvento: number;
  ttEventosAutorizados: number;
  ttCotaOfEscala: number;
  ttCotaPrcEscala: number;
  ttPmsImpedidos: number;

  eventos?: Evento[];
}

interface Evento {
  id: number;
  pjesDistId: number;
  ome?: {
    id: number;
    nomeOme: string;
  };
  codVerba: string;
  nomeEvento: string;
  nomeOme: string;
  statusEvento: string;
  ttCtOfEvento: number;
  ttCtPrcEvento: number;
  valorTtPlanejado: number;
  valorTtExecutado: number;
  saldoFinal: number;
  somaCotaOfEscala: number;
  somaCotaPrcEscala: number;
}

interface Operacao {
  id: number;
  codOp: string;
  nomeOperacao: string;
  pjesEventoId: number;
  omeId: number;
  codVerba: string;
  ttCtOfOper: number;
  ttCtOfExeOper: number;
  ttCtPrcOper: number;
  ttCtPrcExeOper: number;
  nomeOme: string;
}

export function usePjesData(ano: number | null, mes: number | null) {
  // Estados principais
  const [tetos, setTetos] = useState<Teto[]>([]);
  const [tetoSelecionado, setTetoSelecionado] = useState<Teto | null>(null);

  const [distribuicoes, setDistribuicoes] = useState<Distribuicao[]>([]);
  const [pjesdists, setPjesdists] = useState<any[]>([]);

  const [eventosDistribuicao, setEventosDistribuicao] = useState<Evento[]>([]);
  const [distSelecionadaId, setDistSelecionadaId] = useState<number | null>(null);

  // Outros estados que você pode ter
  const [loadingTetos, setLoadingTetos] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  // Busca tetos (exemplo genérico)
  useEffect(() => {
    async function fetchTetos() {
      setLoadingTetos(true);
      try {
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
        setLoadingTetos(false);
      }
    }

    if (ano && mes) {
      fetchTetos();
    }
  }, [ano, mes]);


  // Busca distribuições
  useEffect(() => {
    async function fetchDistribuicoes() {
      try {
        if (!ano || !mes) return;

        const res = await fetch(`/api/pjesdist?ano=${ano}&mes=${mes}`);
        if (!res.ok) throw new Error("Erro ao buscar distribuições");

        const data = await res.json();
        setDistribuicoes(data);
      } catch (e) {
        console.error("Erro ao buscar distribuições:", e);
        setDistribuicoes([]);
      }
    }

    fetchDistribuicoes();
  }, [ano, mes]);

  async function fetchEventosPorDistribuicao(
    distId: number,
    codVerba?: string,
    force: boolean = false
  ) {
    if (!force && distId === distSelecionadaId) return;
    if (!ano || !mes || !codVerba) return;
  
    setLoadingDetalhes(true);
    try {
      setEventosDistribuicao([]);
      setDistSelecionadaId(null);
  
      const params = new URLSearchParams({
        ano: String(ano),
        mes: String(mes),
        codVerba: codVerba,
      });
  
      const res = await fetch(`/api/pjesevento?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar eventos");
  
      const allEventos: Evento[] = await res.json();
  
      const eventosFiltrados = allEventos.filter(
        (evento) => evento.pjesDistId === distId
      );
  
      setEventosDistribuicao(eventosFiltrados);
      setDistSelecionadaId(distId);
    } catch (e) {
      console.error("Erro ao buscar eventos da distribuição:", e);
      setEventosDistribuicao([]);
    } finally {
      setLoadingDetalhes(false);
    }
  }
  
  
  return {
    tetos,
    loadingTetos,
    tetoSelecionado,
    setTetoSelecionado,
    distribuicoes,
    setDistribuicoes,
    pjesdists,
    setPjesdists,
    eventosDistribuicao,
    setEventosDistribuicao,
    fetchEventosPorDistribuicao,
    loadingDetalhes,
  };
  
  
}
