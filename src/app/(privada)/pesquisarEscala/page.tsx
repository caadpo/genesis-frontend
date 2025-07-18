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
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaSpinner,
  FaUniversity,
  FaUser,
} from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import Image from "next/image";

interface Escala {
  dia: string;
  nomeOperacao: string;
  nomeOme: string;
  localApresentacaoSgp: string;
  situacaoSgp: string;
  horaInicio: string;
  horaFinal: string;
  funcao: string;
  statusEscala: string;
  obs: string;
  ttCota: number;

  ultimoStatusLog?: {
    novoStatus: string;
    dataAlteracao: string;
    pg: string;
    imagemUrl: string;
    nomeGuerra: string;
    nomeOme: string;
  };
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

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // remove não números
    if (value.length <= 7) setMatricula(value);
  };

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
                <div className={styles.tileContent}>{escalaDoDia.nomeOme}</div>
              );
            }
          }
          return null;
        }}
      />

      <div className={styles.eventoContainer}>
        <div className={styles.eventoTextoMinhaEscala}>
          <div className={styles.escalaInfo}>
            {(() => {
              const diaStr = date.toLocaleDateString("sv-SE");
              const escalaDoDia = escalas.find((esc) => esc.dia === diaStr);

              if (escalaDoDia) {
                const { dia, nomeMes } = formatDate(escalaDoDia.dia);
                return (
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
                                  escalaDoDia.ultimoStatusLog?.dataAlteracao ??
                                    ""
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return <p>Não há escala para você neste dia.</p>;
              }
            })()}
          </div>
        </div>

        {/* INICIO DO BLOCO DE PESQUISAR OPERAÇÃO */}

        <div className={styles.divPrincipal}>
          <div className={styles.divEsquerdaTelaUsuario}>
            <h3>
              <strong>Operações</strong>
            </h3>
          </div>

          <input
            type="text"
            placeholder="Digite o codigo da Operação"
            className={styles.inputPesquisarUsuario}
          />

          <div className={styles.divSecundaria}>
            <div className={styles.divEsquerdaTelaUsuario}>
              <div className={styles.nomeOperacaoTelaPesquisar}>
                <div>
                  <strong>OPERAÇÃO TRANSPORTE SEGURO | 1º BPM</strong>
                </div>
                <div>COD: 1234567/2025</div>
              </div>
              <div className={styles.usuarioCard}>
                <div style={{ display: "flex" }}>
                  <FaUser className={styles.usuarioSemImagem} />
                  <div style={{ display: "flex" }}>
                    <div className={styles.usuarioInfo}>
                      <span className={styles.usuarioNome}>
                        {user.pg} {user.mat} {user.nomeGuerra}{" "}
                        {user.ome?.nomeOme ?? "OME não informada"} | MOT
                      </span>
                      <div className={styles.usuarioLinha}>
                        <div style={{ display: "flex" }}>
                          <FaCalendar className={styles.iconUsuarioList} />
                          <span className={styles.usuarioFuncao}>
                            02/02/2025 15:00 às 23:00
                          </span>
                        </div>

                        <div style={{ display: "flex" }}>
                          <FaPhone className={styles.iconUsuarioList} />
                          <span className={styles.usuarioFuncao}>
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.commentContainer}>
                      <input
                        type="checkbox"
                        className={styles.checkboxAlinhado}
                      />
                    </div>
                    <div className={styles.commentContainer}>
                      <FaComment className={styles.faComment} />
                    </div>
                  </div>
                </div>

                <div className={styles.usuarioDetalhesMobile}>
                  <ul>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaUser />
                        {user.loginSei}
                      </div>
                      <FaCheck />
                    </li>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaAt />
                        {user.email}
                      </div>
                      <FaCheck />
                    </li>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaUniversity />
                        {user.ome?.diretoria?.nomeDiretoria ?? "Não informada"}
                      </div>
                      <FaCheck />
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.divDireitaTelaUsuario}>
              <div className={styles.usuarioDetalhes}>
                <ul>
                  <li className={styles.liusuarioDetalhes}>
                    <div className={styles.divusuarioDetalhes}>
                      <FaUser />
                      {user.loginSei}
                    </div>
                    <FaCheck />
                  </li>
                  <li className={styles.liusuarioDetalhes}>
                    <div className={styles.divusuarioDetalhes}>
                      <FaAt />
                      {user.email}
                    </div>
                    <FaCheck />
                  </li>
                  <li className={styles.liusuarioDetalhes}>
                    <div className={styles.divusuarioDetalhes}>
                      <FaUniversity />
                      {user.ome?.diretoria?.nomeDiretoria ?? "Não informada"}
                    </div>
                    <FaCheck />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FIM DO BLOCO DE PESQUISAR OPERAÇÃO */}
      </div>
    </>
  );
}
