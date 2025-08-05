import { useState } from "react";

export function useCarregarTeto() {
  const [tetos, setTetos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const carregar = async ({
    ano,
    mes,
    diretoria,
  }: {
    ano?: string;
    mes?: number;
    diretoria?: string;
  }) => {
    try {
      setLoading(true);

      let url = `/api/pjesteto?ano=${ano || ""}`;
      if (mes) url += `&mes=${mes}`;
      if (diretoria) url += `&diretoria=${encodeURIComponent(diretoria)}`;

      const res = await fetch(url);
      const data = await res.json();

      const dados = Array.isArray(data[0]) ? data[0] : data;
      setTetos(dados);
    } catch (error) {
      console.error("Erro ao carregar dados PJES:", error);
    } finally {
      setLoading(false);
    }
  };

  return { tetos, loading, carregar };
}
