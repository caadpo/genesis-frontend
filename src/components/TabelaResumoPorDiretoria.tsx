"use client";

import React from "react";
import { FaStar, FaAngleDoubleUp, FaCheck } from "react-icons/fa";
import styles from "@/app/(privada)/privateLayout.module.css";

interface Evento {
  omeId: number;
  nomeOme: string;
  ttCtOfEvento?: number;
  somaCotaOfEscala?: number;
  ttCtPrcEvento?: number;
  somaCotaPrcEscala?: number;
}

interface Dist {
  eventos: Evento[];
}

interface Resumo {
  somattCtOfEvento: number;
  somattCotaOfEscala: number;
  somattCtPrcEvento: number;
  somattCotaPrcEscala: number;

  //Parte de bauxo do resumo
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
  // Agrupar eventos por omeId
  const eventosFiltrados = eventos.filter(
    (evento) => evento.omeId >= omeMin && evento.omeId <= omeMax
  );

  const agrupados: Record<number, Evento> = {};

  eventosFiltrados.forEach((evento) => {
    if (!agrupados[evento.omeId]) {
      agrupados[evento.omeId] = {
        omeId: evento.omeId,
        nomeOme: evento.nomeOme,
        ttCtOfEvento: 0,
        somaCotaOfEscala: 0,
        ttCtPrcEvento: 0,
        somaCotaPrcEscala: 0,
      };
    }

    agrupados[evento.omeId].ttCtOfEvento! += evento.ttCtOfEvento || 0;
    agrupados[evento.omeId].somaCotaOfEscala! += evento.somaCotaOfEscala || 0;
    agrupados[evento.omeId].ttCtPrcEvento! += evento.ttCtPrcEvento || 0;
    agrupados[evento.omeId].somaCotaPrcEscala! += evento.somaCotaPrcEscala || 0;
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
            <th>Unidades</th>
            <th>Cotas Oficiais</th>
            <th>Cotas Praças</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {eventosAgrupados.map((evento, idx) => (
            <tr key={idx}>
              <td>{evento.nomeOme || "—"}</td>
              <td>
                {evento.ttCtOfEvento} | {evento.somaCotaOfEscala}
              </td>
              <td>
                {evento.ttCtPrcEvento} | {evento.somaCotaPrcEscala}
              </td>
              <td>
                <FaCheck />
              </td>
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
