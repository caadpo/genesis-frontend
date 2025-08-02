// src/app/(privada)/dashboard/hooks/useResumoPorOme.ts

import { useState } from "react";

export function useResumoPorOme() {
  const [resumo, setResumo] = useState<any[]>([]);
  const [loadingResumo, setLoadingResumo] = useState(false);

  const carregarResumo = async ({
    ano,
    mes,
  }: {
    ano: string;
    mes?: string;
  }) => {
    setLoadingResumo(true);
    try {
      let url = `/api/pjesteto/dashboard/resumo-por-ome?ano=${ano}`;
      if (mes) url += `&mes=${mes}`;

      const res = await fetch(url);
      const data = await res.json();

      setResumo(data);
    } catch (error) {
      console.error("Erro ao carregar resumo por OME:", error);
    } finally {
      setLoadingResumo(false);
    }
  };

  return { resumo, loadingResumo, carregarResumo };
}
