"use client";

import React from "react";
import { FaStar, FaAngleDoubleUp, FaCheck } from "react-icons/fa";
import styles from "@/app/(privada)/privateLayout.module.css";

interface Evento {
  omeId: number;
  nomeOme: string;
  codVerba: number;
  ttCtOfEvento?: number;
  somaCotaOfEscala?: number;
  ttCtPrcEvento?: number;
  somaCotaPrcEscala?: number;
  valorTtPlanejado?: number;
}

interface Resumo {
  somattCtOfEvento: number;
  somattCotaOfEscala: number;
  somattCtPrcEvento: number;
  somattCotaPrcEscala: number;
  valorTtPlanejado: number;
  valorTtExecutado: number;
  saldoFinal: number;
}

interface Props {
  titulo: string;
  resumo: Resumo;
  omeMin: number;
  omeMax: number;
  eventos: Evento[];
}

const TabelaResumoPorDiretoria: React.FC<Props> = ({
  titulo,
  resumo,
  omeMin,
  omeMax,
  eventos,
}) => {
  // (Opcional) Mapeamento dos nomes das verbas
  const nomeVerbas: Record<number, string> = {
    247: "DPO",
    255: "TI",
    // Adicione mais conforme necessário
  };

  const eventosFiltrados = eventos.filter(
    (evento) => evento.omeId >= omeMin && evento.omeId <= omeMax
  );

  const agrupados: Record<string, Evento> = {};

  eventosFiltrados.forEach((evento) => {
    const chave = `${evento.omeId}-${evento.codVerba}`;

    if (!agrupados[chave]) {
      agrupados[chave] = {
        omeId: evento.omeId,
        nomeOme: evento.nomeOme,
        codVerba: evento.codVerba,
        ttCtOfEvento: 0,
        somaCotaOfEscala: 0,
        ttCtPrcEvento: 0,
        somaCotaPrcEscala: 0,
        valorTtPlanejado: 0,
      };
    }

    agrupados[chave].ttCtOfEvento! += evento.ttCtOfEvento || 0;
    agrupados[chave].somaCotaOfEscala! += evento.somaCotaOfEscala || 0;
    agrupados[chave].ttCtPrcEvento! += evento.ttCtPrcEvento || 0;
    agrupados[chave].somaCotaPrcEscala! += evento.somaCotaPrcEscala || 0;
    agrupados[chave].valorTtPlanejado! += evento.valorTtPlanejado || 0;
  });

  const eventosAgrupados = Object.values(agrupados);

  return (
    <div>
      {/* Cabeçalho */}
      <div className={styles.tituloOme}>
        <h4 className={styles.h3TituloOme}>{titulo}</h4>
        <div className={styles.tituloOfePrc}>
          <FaStar /> {resumo.somattCtOfEvento} | {resumo.somattCotaOfEscala}
        </div>
        <div className={styles.tituloOfePrc}>
          <FaAngleDoubleUp /> {resumo.somattCtPrcEvento} |{" "}
          {resumo.somattCotaPrcEscala}
        </div>
      </div>

      {/* Tabela */}
      <table className={styles["tabela-zebra-ome"]}>
        <thead>
          <tr>
            <th>Unidade</th>
            <th>Oficiais</th>
            <th>Praças</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {eventosAgrupados.map((evento, idx) => (
            <tr key={idx}>
              <td>{evento.nomeOme || "—"}</td>
              <td>{evento.ttCtOfEvento} | {evento.somaCotaOfEscala}</td>
              <td>{evento.ttCtPrcEvento} | {evento.somaCotaPrcEscala}</td>
              <td><FaCheck /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumo */}
      <div className={styles.resumoPrincipalOme}>
        <h3 className={styles.h3ResumoOme}>
          <strong>Planejado:</strong>
        </h3>
        <span className={styles.spanResumoOme}>
          R$ {(resumo?.valorTtPlanejado ?? 0).toLocaleString("pt-BR")}
        </span>
      </div>
      <hr className={styles.hrResumoOme} />

      <div className={styles.resumoPrincipalOme}>
        <h3 className={styles.h3ResumoOme}>
          <strong>Executado:</strong>
        </h3>
        <span className={styles.spanResumoOme}>
          R$ {(resumo?.valorTtExecutado ?? 0).toLocaleString("pt-BR")}
        </span>
      </div>
      <hr className={styles.hrResumoOme} />

      <div className={styles.resumoSaldoOme}>
        <h3 className={styles.h3ResumoOme}>
          <strong>Saldo:</strong>
        </h3>
        <span className={styles.spanResumoOme}>
          R$ {(resumo?.saldoFinal ?? 0).toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
};

export default TabelaResumoPorDiretoria;
