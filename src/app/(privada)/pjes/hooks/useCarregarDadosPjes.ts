import { useEffect, useState } from "react";

// hooks/useCarregarDadosPjes.ts
export function useCarregarDadosPjes(
  ano: string | null,
  mesNum: number | null,
  pjeseventos: number = 0,
  pjesoperacoes?: any[],
  pjesescalas?: any[]
) {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dados, setDados] = useState({
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

        const [resTeto, resDist, resEvento, resResumo, resOme, resDiretoria] =
          await Promise.all([
            fetch(`/api/pjesteto?${query}`),
            fetch(`/api/pjesdist?${query}`),
            fetch(`/api/pjesevento?${query}`),
            fetch(
              `/api/pjesevento/resumo-por-diretoria?${query}&omeMin=1&omeMax=99`
            ),
            fetch(`/api/ome`),
            fetch(`/api/diretoria`),
          ]);

        const [tetos, dists, eventos, resumoPorDiretoria, ome, diretoria] =
          await Promise.all([
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

  // Função para atualizar uma operação específica dentro dos eventos
  const atualizarOperacao = (
    operacaoIdAtualizada: number,
    novosCampos: Partial<PjesOperacao>
  ) => {
    setDados((prevDados) => {
      const eventosAtualizados = prevDados.eventos.map((evento) => {
        if (!evento.operacoes) return evento;

        const operacoesAtualizadas = evento.operacoes.map((op) => {
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
