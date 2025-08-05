import { useEffect, useState } from "react";

// Interface baseada no ReturnPjesEscalaDto (você pode ajustar conforme necessário)
interface PjesEscala {
  id: number;
  dia: string;
  nomeOperacao: string;
  nomeOme: string;
  localApresentacaoSgp: string;
  situacaoSgp: string;
  horaInicio: string;
  horaFinal: string;
  funcao: string;
  anotacaoEscala: string;
  statusEscala: string;
  ttCota: number;
  codOp: string;
  tipoSgp: string;

  statusLogs?: {
    imagemUrl?: string;
    pg?: string;
    nomeGuerra?: string;
    nomeOme?: string;
    dataAlteracao?: string;
  }[];

  ultimoStatusLog?: {
    novoStatus: string;
    dataAlteracao: string;
    pg: string;
    imagemUrl: string;
    nomeGuerra: string;
    nomeOme: string;
  };

  comentarios?: {
    comentario: string;
    createdAt: string;
    autor?: {
      pg?: string;
      nomeGuerra: string;
      nomeOme: string;
      imagemUrl?: string;
    };
  }[];
}

// Interface baseada no ReturnPjesOperacaoDto
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
  pjesescalas?: PjesEscala[];
  nomeOme?: string;
  ttCtOfExeOper: number;
  ttCtPrcExeOper: number;
}

// Hook
export function useCarregarDadosPjes(
  ano: string | null,
  mesNum: number | null,
  pjeseventos: number = 0,
  pjesoperacoes?: PjesOperacao[],
  pjesescalas?: PjesEscala[]
) {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dados, setDados] = useState<{
    tetos: any[];
    dists: any[];
    eventos: any[];
    resumoPorDiretoria: any[];
    ome: any[];
    diretoria: any[];
  }>({
    tetos: [],
    dists: [],
    eventos: [],
    resumoPorDiretoria: [],
    ome: [],
    diretoria: [],
  });

  useEffect(() => {
    const carregar = async () => {
      if (!ano || !mesNum) return;

      try {
        const query = `ano=${ano}&mes=${mesNum}`;

        const [
          resTeto,
          resDist,
          resEvento,
          resResumo,
          resOme,
          resDiretoria,
        ] = await Promise.all([
          fetch(`/api/pjesteto?${query}`),
          fetch(`/api/pjesdist?${query}`),
          fetch(`/api/pjesevento?${query}`),
          fetch(`/api/pjesevento/resumo-por-diretoria?${query}&omeMin=1&omeMax=99`),
          fetch(`/api/ome`),
          fetch(`/api/diretoria`),
        ]);

        const [
          tetos,
          dists,
          eventos,
          resumoPorDiretoria,
          ome,
          diretoria,
        ] = await Promise.all([
          resTeto.json(),
          resDist.json(),
          resEvento.json(),
          resResumo.json(),
          resOme.json(),
          resDiretoria.json(),
        ]);

        setDados({
          tetos,
          dists,
          eventos,
          resumoPorDiretoria,
          ome,
          diretoria,
        });
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setErro("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [ano, mesNum, pjeseventos, pjesoperacoes, pjesescalas]);

  useEffect(() => {
    console.log("🚀 Dados atualizados do hook (eventos):", dados.eventos);
  }, [dados.eventos]);

  // Atualiza uma operação específica dentro dos eventos
  const atualizarOperacao = (
    operacaoIdAtualizada: number,
    novosCampos: Partial<PjesOperacao>
  ) => {
    setDados((prevDados) => {
      const eventosAtualizados = prevDados.eventos.map((evento) => {
        if (!evento.operacoes) return evento;

        const operacoesAtualizadas = evento.operacoes.map((op: PjesOperacao) => {
          if (op.id !== operacaoIdAtualizada) return op;

          return {
            ...op,
            ...novosCampos,
          };
        });

        return {
          ...evento,
          operacoes: operacoesAtualizadas,
        };
      });

      return {
        ...prevDados,
        eventos: eventosAtualizados,
      };
    });
  };

  return { ...dados, loading, erro, atualizarOperacao };
}
