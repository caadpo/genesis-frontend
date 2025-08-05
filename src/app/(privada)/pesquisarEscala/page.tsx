"use client";

import { useUser } from "../../context/UserContext";
import { useState } from "react";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import styles from "../privateLayout.module.css";
import {
  FaAirbnb,
  FaAt,
  FaCalendar,
  FaCheck,
  FaCheckSquare,
  FaComment,
  FaFilter,
  FaInfo,
  FaMapMarkerAlt,
  FaPhone,
  FaRegSquare,
  FaSearch,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import Image from "next/image";
import ObsModal from "@/components/ObsModal";

interface Escala {
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
      nomeGuerra: string;
      nomeOme: string;
      imagemUrl?: string;
    };
  }[];
}

interface TileProps {
  date: Date;
  view: "month" | "year" | "decade" | "century";
}

export default function PesquisarEscala() {
  const user = useUser();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [matricula, setMatricula] = useState(""); // controla o input
  const [matriculaPesquisada, setMatriculaPesquisada] = useState(""); // guarda a última matrícula usada

  //FORMATANDO A DATA PARA O TIPO BRASILEIRO
  const formatDate = (dateStr: string) => {
    if (!dateStr) return { dia: "--", mes: "--", nomeMes: "--" };
    const [ano, mes, dia] = dateStr.split("-");
    const nomesMeses = [
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
    const nomeMes = nomesMeses[parseInt(mes, 10) - 1] ?? "MÊS?";
    return { dia, mes, nomeMes };
  };

  //FORMATANDO A DATA E HORA TIRAR AUTERAÇÃO
  const formatarDataHoraBR = (dataIso: string): string => {
    if (!dataIso) return "";

    const data = new Date(dataIso);

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
  };

  //INICIO BUSCAR AS ESCALAS PARA RENDERIZER NO CALENDARIO
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ano, setAno] = useState<string | null>(null);
  const [mes, setMes] = useState<string | null>(null);

  const buscarEscalas = async () => {
    if (matricula.length !== 7) return;

    setLoading(true);
    setErro("");
    setEscalas([]);
    try {
      const res = await fetch(
        `/api/pjesescala/escalas-por-matricula?mat=${matricula}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao buscar escalas");
      setEscalas(data);
      setMatriculaPesquisada(matricula);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };
  //FIM BUSCAR AS ESCALAS PARA RENDERIZER NO CALENDARIO

  // INICIO TRATAMENTO DO CAMPO DO IMPUT PARA BUSCAR OS DADOS PELA MATRICULA
  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // remove não números
    if (value.length <= 7) setMatricula(value);
  };
  // FIM TRATAMENTO DO CAMPO DO IMPUT PARA BUSCAR OS DADOS PELA MATRICULA

  // INICIO DA ESTRUTURA DAS OPERAÇÕES

  const [codOp, setCodOp] = useState("");
  const [operacao, setOperacao] = useState<any | null>(null);
  const [erroOperacao, setErroOperacao] = useState("");
  //const [selectedEscala, setSelectedEscala] = useState<any | null>(null);
  const [selectedEscala, setSelectedEscala] = useState<Escala | null>(null);

  const [mostrarModalObs, setMostrarModalObs] = useState(false);
  const [modalDataObs, setModalDataObs] = useState<any | null>(null);

  const buscarOperacaoPorCodOp = async () => {
    if (!codOp) return;

    setErroOperacao("");
    setOperacao(null);

    try {
      const res = await fetch(
        `/api/pjesoperacao/by-codop/${encodeURIComponent(codOp)}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao buscar operação");

      setOperacao(data);
    } catch (err: any) {
      setErroOperacao(err.message);
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

      const dataAtual = new Date().toISOString();

      // Atualiza o estado local da operação (operacao.pjesescalas)
      setOperacao((prevOperacao: any) => {
        if (!prevOperacao) return prevOperacao;

        const escalasAtualizadas = prevOperacao.pjesescalas.map((e: any) =>
          e.id === escala.id
            ? {
                ...e,
                statusEscala: novoStatus,
                ultimoStatusLog: {
                  novoStatus,
                  dataAlteracao: dataAtual,
                  pg: user?.pg || "",
                  imagemUrl:
                    user?.imagemUrl || "/assets/images/user_padrao.png",
                  nomeGuerra: user?.nomeGuerra || "",
                  nomeOme: user?.ome?.nomeOme || "",
                },
              }
            : e
        );

        // Atualiza escala selecionada se for a mesma
        if (selectedEscala?.id === escala.id) {
          setSelectedEscala((prev: any) => ({
            ...prev,
            statusEscala: novoStatus,
            ultimoStatusLog: {
              novoStatus,
              dataAlteracao: dataAtual,
              pg: user?.pg || "",
              imagemUrl: user?.imagemUrl || "/assets/images/user_padrao.png",
              nomeGuerra: user?.nomeGuerra || "",
              nomeOme: user?.ome?.nomeOme || "",
            },
          }));
        }

        return {
          ...prevOperacao,
          pjesescalas: escalasAtualizadas,
        };
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro interno ao atualizar status.");
    }
  };

  const formatarDataParaDiaMes = (dataStr: string) => {
    const data = getDataLocal(dataStr); // <- isso evita o erro de fuso
    return data
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      .slice(0, 5);
  };

  const handleAbrirObs = (escala: any) => {
    setModalDataObs({
      ...escala,
      userObs: user,
    });
    setMostrarModalObs(true);
  };

  const getDataLocal = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  };

  const [filtroHoje, setFiltroHoje] = useState(false);

  // FIM DA ESTRUTURA DAS OPERAÇÕES

  if (!user) return <p>Carregando dados do usuário...</p>;

  return (
    <>
      <div className={styles.headerPesquisarEscala}>
        <h3>
          <strong>Pesquisar Escala</strong>
        </h3>
      </div>

      <div className={styles.pesquisaContainer}>
        <input
          type="text"
          value={matricula}
          onChange={handleMatriculaChange}
          placeholder="Digite a matrícula (7 dígitos)"
          className={`${styles.inputPesquisar} ${styles.inputFlex}`}
        />

        <button
          onClick={buscarEscalas}
          disabled={matricula.length !== 7 || loading}
          className={`${styles.botaoPesquisar} ${
            matricula.length === 7 ? styles.botaoAtivo : styles.botaoDesativado
          }`}
        >
          {loading ? <FaSpinner className="spin" /> : <FaSearch />}
        </button>
      </div>

      <Calendar
        onChange={(value: Date | Date[]) => {
          const selected = Array.isArray(value) ? value[0] : value;
          setDate(selected);
        }}
        value={date}
        className={styles.customCalendar}
        tileContent={({ date, view }: TileProps) => {
          if (view === "month") {
            const diaStr = date.toISOString().split("T")[0];
            const escalaDoDia = escalas.find((esc) => esc.dia === diaStr);

            if (escalaDoDia) {
              return (
                <div style={{ fontSize: "0.5rem", color: "blue" }}>
                  {escalaDoDia.nomeOme}
                </div>
              );
            }
          }
          return null;
        }}
      />

      <div style={{ marginTop: "10px" }}>
        <div className={styles.eventoTextoMinhaEscala}>
          <div className={styles.escalaInfo}>
            {(() => {
              const diaStr = date.toLocaleDateString("sv-SE");
              const escalaDoDia = escalas.find((esc) => esc.dia === diaStr);

              if (escalaDoDia) {
                const { dia, nomeMes } = formatDate(escalaDoDia.dia);
                return (
                  <div>
                    <div style={{ textAlign: "right", fontSize: "12px" }}>
                      COP: <strong>{escalaDoDia.codOp}</strong>
                    </div>
                    <div className={styles.escalaLinha}>
                      <div className={styles.dataColuna}>
                        <span className={styles.dia}>{dia}</span>
                        <span className={styles.mes}>{nomeMes}</span>
                        <span className={styles.horarioEscala}>
                          {escalaDoDia.horaInicio.slice(0, 5)} às{" "}
                          {escalaDoDia.horaFinal.slice(0, 5)}
                        </span>
                      </div>

                      <div>
                        <span className={styles.nome}>
                          {escalaDoDia.nomeOperacao} | {escalaDoDia.nomeOme}
                        </span>
                        <div className={styles.detalhesItemCalendar}>
                          <FaMapMarkerAlt />
                          <span className={styles.localApresentacao}>
                            {escalaDoDia.localApresentacaoSgp}
                          </span>
                        </div>
                        <div className={styles.detalhesContainer}>
                          <div className={styles.detalhesItemCalendar}>
                            <FaAirbnb />
                            <span className={styles.detalheTexto}>
                              Função: {escalaDoDia.funcao}
                            </span>
                          </div>
                          <div className={styles.detalhesItemCalendar}>
                            <FaUser />
                            <span className={styles.detalheTexto}>
                              {escalaDoDia.situacaoSgp}
                            </span>
                          </div>
                        </div>
                        <div className={styles.detalhesAnotacaoEscala}>
                          <div className={styles.detalhesItemCalendar}>
                            <FaInfo />
                            <span className={styles.detalheTexto}>
                              Anotações:{" "}
                            </span>
                            <strong>{escalaDoDia.anotacaoEscala}</strong>
                          </div>
                        </div>
                        <h1>Situação da Escala</h1>
                        <div className={styles.detalhesItemCalendar}>
                          {escalaDoDia.statusEscala === "HOMOLOGADA" ? (
                            <>
                              <FaCheckSquare style={{ color: "green" }} />
                              <span className={styles.statusConfirmado}>
                                CONFIRMADA
                              </span>
                            </>
                          ) : (
                            <>
                              <FaTriangleExclamation
                                style={{ color: "#b60b0b" }}
                              />
                              <span className={styles.statusPendente}>
                                {escalaDoDia.statusEscala}
                              </span>
                            </>
                          )}
                        </div>
                        <div className={styles.detalhesItemCalendar}>
                          <div className={styles.usuarioLogInfo}>
                            {escalaDoDia.statusEscala === "AUTORIZADA" ? (
                              <p>Aguardando confirmação</p>
                            ) : (
                              <>
                                <Image
                                  width={10}
                                  height={10}
                                  src={
                                    escalaDoDia.ultimoStatusLog?.imagemUrl ||
                                    "/assets/images/user_padrao.png"
                                  }
                                  alt="img_usuario"
                                  className={styles.imgUserModalAlteracao}
                                />
                                <span className={styles.statusUsuario}>
                                  <strong>
                                    {escalaDoDia.ultimoStatusLog?.pg}{" "}
                                    {escalaDoDia.ultimoStatusLog?.nomeGuerra}
                                  </strong>{" "}
                                  {escalaDoDia.ultimoStatusLog?.nomeOme} às{" "}
                                  {formatarDataHoraBR(
                                    escalaDoDia.ultimoStatusLog
                                      ?.dataAlteracao ?? ""
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return <p>Digite a Matricula para Pesquisar a escala.</p>;
              }
            })()}
          </div>
        </div>

        {/* INÍCIO DO BLOCO DE PESQUISAR OPERAÇÃO */}
        <div className={styles.divPrincipal}>
          {/* Cabeçalho */}
          <div className={styles.divEsquerdaTelaUsuario}>
            <h3 style={{ marginTop: "40px" }}>
              <strong>Operações</strong>
            </h3>
          </div>

          {/* Campo de busca */}
          <div className={styles.pesquisaContainer}>
            <input
              type="text"
              value={codOp}
              onChange={(e) => setCodOp(e.target.value)}
              placeholder="Código da Operação ex: 12345/072025"
              className={`${styles.inputPesquisar} ${styles.inputFlex}`}
            />

            <button
              onClick={buscarOperacaoPorCodOp}
              className={`${styles.botaoPesquisar} ${
                codOp ? styles.botaoAtivo : styles.botaoDesativado
              }`}
            >
              <FaSearch />
            </button>
          </div>

          {/* Se operação encontrada, exibe resultados */}
          {operacao ? (
            <div className={styles.divSecundaria}>
              {/* COLUNA ESQUERDA */}
              <div className={styles.divEsquerdaTelaUsuario}>
                <div>
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>COP: {operacao.codOp}</strong>
                    </span>

                    <label
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaFilter />
                      Hoje:
                      <input
                        type="radio"
                        checked={filtroHoje}
                        onChange={() => setFiltroHoje(!filtroHoje)}
                      />
                    </label>
                  </div>

                  <div className={styles.nomeOperacaoTelaPesquisar}>
                    <strong>
                      {operacao.nomeOperacao} | {operacao.nomeOme}
                    </strong>
                  </div>
                </div>

                {(filtroHoje
                  ? operacao.pjesescalas.filter((escala: any) => {
                      const dataEscala = getDataLocal(escala.dataInicio);
                      const hoje = new Date();
                      return (
                        dataEscala.getDate() === hoje.getDate() &&
                        dataEscala.getMonth() === hoje.getMonth() &&
                        dataEscala.getFullYear() === hoje.getFullYear()
                      );
                    })
                  : operacao.pjesescalas
                ).map((escala: any) => (
                  <div
                    key={escala.id}
                    className={`${styles.usuarioCard} ${
                      selectedEscala?.id === escala.id
                        ? styles.selectedCard
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedEscala(
                        selectedEscala?.id === escala.id ? null : escala
                      )
                    }
                  >
                    <div style={{ display: "flex", width: "100%" }}>
                      <FaUser
                        className={styles.usuarioSemImagemTelaPesquisar}
                      />
                      <div className={styles.usuarioInfo}>
                        <span className={styles.usuarioNomePesquisarOperacao}>
                          {escala.pgSgp} {escala.matSgp} {escala.nomeGuerraSgp}{" "}
                          {escala.omeSgp}
                          <span
                            style={{ paddingLeft: "5px", color: "#0740dd" }}
                          >
                            | {escala.funcao}
                          </span>
                        </span>
                        <div className={styles.usuarioLinha}>
                          <div style={{ display: "flex" }}>
                            <FaCalendar className={styles.iconUsuarioList} />
                            <span className={styles.usuarioFuncao}>
                              {formatarDataParaDiaMes(escala.dataInicio)}{" "}
                              <span
                                style={{
                                  marginLeft: "10px",
                                  marginRight: "10px",
                                }}
                              >
                                {escala.horaInicio.slice(0, 5)} às{" "}
                                {escala.horaFinal.slice(0, 5)}
                              </span>
                            </span>
                          </div>
                          <div style={{ display: "flex" }}>
                            <FaPhone className={styles.iconUsuarioList} />
                            <span className={styles.usuarioFuncao}>
                              {escala.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.alinharDireita}>
                        <div
                          className={styles.commentContainer}
                          title="Clique para homologar/desfazer"
                          onClick={() => toggleStatusEscala(escala)}
                        >
                          {escala.statusEscala === "HOMOLOGADA" ? (
                            <FaCheckSquare
                              style={{ color: "#1b9c2d", fontSize: "25px" }}
                            />
                          ) : (
                            <FaRegSquare
                              style={{ color: "#968f8f", fontSize: "16px" }}
                            />
                          )}
                        </div>
                        <div
                          className={styles.commentContainer}
                          onClick={() => handleAbrirObs(escala)}
                        >
                          <FaComment
                            className={styles.faComment}
                            color={
                              escala.comentarios &&
                              escala.comentarios.length > 0
                                ? "#007bff"
                                : "#888"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* INICIO DETALHES MOBILE */}
                    {selectedEscala?.id === escala.id && (
                      <div
                        className={styles.usuarioDetalhesMobile}
                        data-mobile-only
                      >
                        <ul style={{ marginLeft: "1px" }}>
                          <li className={styles.liusuarioDetalhes}>
                            <div className={styles.divusuarioDetalhes}>
                              <FaMapMarkerAlt />
                              {selectedEscala.localApresentacaoSgp}
                            </div>
                            <FaCheck />
                          </li>
                          <li className={styles.liusuarioDetalhes}>
                            <div className={styles.divusuarioDetalhes}>
                              <FaInfo />
                              {selectedEscala.anotacaoEscala}
                            </div>
                            <FaCheck />
                          </li>

                          <h1 style={{ marginTop: "20px" }}>
                            <strong>Situação da Escala</strong>
                          </h1>
                          <div className={styles.detalhesItemCalendar}>
                            {selectedEscala.statusEscala === "HOMOLOGADA" ? (
                              <>
                                <FaCheckSquare
                                  style={{ color: "green", marginLeft: "5px" }}
                                />
                                <span className={styles.statusConfirmado}>
                                  CONFIRMADA
                                </span>
                              </>
                            ) : (
                              <>
                                <FaTriangleExclamation
                                  style={{ color: "#b60b0b" }}
                                />
                                <span className={styles.statusPendente}>
                                  {selectedEscala.statusEscala}
                                </span>
                              </>
                            )}
                          </div>

                          <div className={styles.detalhesItemCalendar}>
                            <div className={styles.usuarioLogInfo}>
                              {selectedEscala.statusEscala === "AUTORIZADA" ||
                              selectedEscala.statusLogs?.length === 0 ? (
                                <p>Aguardando confirmação</p>
                              ) : (
                                (() => {
                                  return (
                                    <>
                                      <Image
                                        width={10}
                                        height={10}
                                        src={
                                          selectedEscala?.ultimoStatusLog
                                            ?.imagemUrl ||
                                          "/assets/images/user_padrao.png"
                                        }
                                        alt="img_usuario"
                                        className={styles.imgUserModalAlteracao}
                                      />
                                      <span className={styles.statusUsuario}>
                                        <strong>
                                          {selectedEscala?.ultimoStatusLog?.pg}{" "}
                                          {
                                            selectedEscala?.ultimoStatusLog
                                              ?.nomeGuerra
                                          }
                                        </strong>{" "}
                                        {
                                          selectedEscala?.ultimoStatusLog
                                            ?.nomeOme
                                        }{" "}
                                        em{" "}
                                        {formatarDataHoraBR(
                                          selectedEscala?.ultimoStatusLog
                                            ?.dataAlteracao ?? ""
                                        )}
                                      </span>
                                    </>
                                  );
                                })()
                              )}
                            </div>
                          </div>

                          <h1 style={{ marginTop: "20px" }}>
                            <strong>Observações:</strong>
                          </h1>
                          {selectedEscala.comentarios?.length ? (
                            selectedEscala.comentarios.map(
                              (comentario, idx) => (
                                <div
                                  key={idx}
                                  className={styles.usuarioLogInfo}
                                >
                                  <Image
                                    width={20}
                                    height={20}
                                    src={
                                      comentario.autor?.imagemUrl ||
                                      "/assets/images/user_padrao.png"
                                    }
                                    alt="img_usuario"
                                    className={styles.imgUserModalAlteracao}
                                  />
                                  <span className={styles.statusUsuario}>
                                    <strong>
                                      {comentario.autor?.pg}{" "}
                                      {comentario.autor?.nomeGuerra} -{" "}
                                      {comentario.autor?.nomeOme}
                                    </strong>
                                    <br />"{comentario.comentario}" <br />
                                    {formatarDataHoraBR(comentario.createdAt)}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <p style={{ marginTop: "10px" }}>
                              Nenhuma observação até o momento.
                            </p>
                          )}
                        </ul>
                      </div>
                    )}
                    {/* FIM DETALHES MOBILE */}
                  </div>
                ))}
              </div>

              {/* INICIO COLUNA DIREITA – Detalhes no DESKTOP */}
              <div
                style={{ marginTop: "44px", marginLeft: "0px" }}
                className={styles.divDireitaTelaUsuario}
              >
                {selectedEscala ? (
                  <div className={styles.usuarioDetalhes}>
                    <div className={styles.nomeOperacaoTelaPesquisar}>
                      <strong>Detalhes da Escala</strong>
                    </div>
                    <ul style={{ marginLeft: "44px" }}>
                      <li className={styles.liusuarioDetalhes}>
                        <div className={styles.divusuarioDetalhes}>
                          <FaMapMarkerAlt /> Local de Apresentação:
                          {selectedEscala.localApresentacaoSgp}
                        </div>
                        <FaCheck />
                      </li>
                      <li className={styles.liusuarioDetalhes}>
                        <div className={styles.divusuarioDetalhes}>
                          <FaInfo />
                          {selectedEscala.anotacaoEscala}
                        </div>
                        <FaCheck />
                      </li>

                      <h1 style={{ marginTop: "20px" }}>
                        <strong>Situação da Escala</strong>
                      </h1>
                      <div className={styles.detalhesItemCalendar}>
                        {selectedEscala.statusEscala === "HOMOLOGADA" ? (
                          <>
                            <FaCheckSquare
                              style={{ color: "green", marginLeft: "5px" }}
                            />
                            <span className={styles.statusConfirmado}>
                              CONFIRMADA
                            </span>
                          </>
                        ) : (
                          <>
                            <FaTriangleExclamation
                              style={{ color: "#b60b0b" }}
                            />
                            <span className={styles.statusPendente}>
                              {selectedEscala.statusEscala}
                            </span>
                          </>
                        )}
                      </div>

                      <div className={styles.detalhesItemCalendar}>
                        <div className={styles.usuarioLogInfo}>
                          {selectedEscala.statusEscala === "AUTORIZADA" ||
                          selectedEscala.statusLogs?.length === 0 ? (
                            <p>Aguardando confirmação</p>
                          ) : (
                            (() => {
                              return (
                                <>
                                  <Image
                                    width={10}
                                    height={10}
                                    src={
                                      selectedEscala?.ultimoStatusLog
                                        ?.imagemUrl ||
                                      "/assets/images/user_padrao.png"
                                    }
                                    alt="img_usuario"
                                    className={styles.imgUserModalAlteracao}
                                  />
                                  <span className={styles.statusUsuario}>
                                    <strong>
                                      {selectedEscala?.ultimoStatusLog?.pg}{" "}
                                      {
                                        selectedEscala?.ultimoStatusLog
                                          ?.nomeGuerra
                                      }
                                    </strong>{" "}
                                    {selectedEscala?.ultimoStatusLog?.nomeOme}{" "}
                                    em{" "}
                                    {formatarDataHoraBR(
                                      selectedEscala?.ultimoStatusLog
                                        ?.dataAlteracao ?? ""
                                    )}
                                  </span>
                                </>
                              );
                            })()
                          )}
                        </div>
                      </div>

                      <h1 style={{ marginTop: "20px" }}>
                        <strong>Observações:</strong>
                      </h1>
                      {selectedEscala.comentarios?.length ? (
                        selectedEscala.comentarios.map((comentario, idx) => (
                          <div key={idx} className={styles.usuarioLogInfo}>
                            <Image
                              width={20}
                              height={20}
                              src={
                                comentario.autor?.imagemUrl ||
                                "/assets/images/user_padrao.png"
                              }
                              alt="img_usuario"
                              className={styles.imgUserModalAlteracao}
                            />
                            <span className={styles.statusUsuario}>
                              <strong>
                                {comentario.autor?.pg}{" "}
                                {comentario.autor?.nomeGuerra} -{" "}
                                {comentario.autor?.nomeOme}
                              </strong>
                              <br />"{comentario.comentario}"{" "}
                              {formatarDataHoraBR(comentario.createdAt)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p style={{ marginTop: "10px" }}>Nenhum comentário.</p>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p>Selecione uma escala para ver os detalhes</p>
                )}
              </div>
              {/* FIM COLUNA DIREITA – Detalhes no DESKTOP */}
            </div>
          ) : erroOperacao ? (
            <p style={{ color: "red" }}>{erroOperacao}</p>
          ) : null}
        </div>
        {/* FIM DO BLOCO DE PESQUISAR OPERAÇÃO */}

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

              // Atualize o comentário no modal (se precisar)
              setModalDataObs((prev) => ({
                ...prev,
                obs: result.obs,
                updatedObsAt: result.updatedObsAt,
                userObs: result.userObs?.ome ? result.userObs : prev?.userObs,
              }));

              // ✅ Atualize a escala selecionada com o novo comentário
              const novoComentario = {
                comentario: dados.obs,
                createdAt: new Date().toISOString(),
                autor: {
                  pg: user?.pg,
                  nomeGuerra: user?.nomeGuerra,
                  nomeOme: user?.nomeOme,
                  imagemUrl: user?.imagemUrl,
                },
              };

              setSelectedEscala((prev: any) => ({
                ...prev,
                comentarios: [...(prev?.comentarios || []), novoComentario],
              }));

              // ✅ Também atualize na lista de escalas da operação
              setOperacao((prevOperacao: any) => {
                if (!prevOperacao) return prevOperacao;

                const escalasAtualizadas = prevOperacao.pjesescalas.map(
                  (e: any) =>
                    e.id === id
                      ? {
                          ...e,
                          comentarios: [
                            ...(e.comentarios || []),
                            novoComentario,
                          ],
                        }
                      : e
                );

                return {
                  ...prevOperacao,
                  pjesescalas: escalasAtualizadas,
                };
              });

              return true;
            } catch (error) {
              console.error("Erro ao salvar observação:", error);
              alert("Erro interno ao salvar observação.");
              return false;
            }
          }}
        />
      </div>
    </>
  );
}
