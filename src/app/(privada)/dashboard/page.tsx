"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "../privateLayout.module.css";
import { useUser } from "@/app/context/UserContext";
import { useCarregarTeto } from "./hooks/useCarregarTeto";
import { useResumoPorOme } from "./hooks/useResumoPorOme";
import {
  FaChartSimple,
  FaListCheck,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";
import { PiChartLineDownBold, PiChartLineUpBold } from "react-icons/pi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import { FaChartBar, FaCheck, FaLock } from "react-icons/fa";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  ChartDataLabels,
  Legend
);

export default function Dashboard() {
  const [selectedTetoId, setSelectedTetoId] = useState<number | null>(null);
  const [pjestetos, setPjestetos] = useState<any[]>([]);
  const [dadosDist, setDadosDist] = useState<any | null>(null);

  const [anoFiltro, setAnoFiltro] = useState<string>(
    String(new Date().getFullYear())
  );
  const [mesFiltro, setMesFiltro] = useState<string>("");
  const [diretoriaFiltro, setDiretoriaFiltro] = useState<string>("");

  const user = useUser();
  const { tetos, loading, carregar } = useCarregarTeto();
  const { resumo, loadingResumo, carregarResumo } = useResumoPorOme();

  const apenasMaster = (type?: number) =>
    type !== undefined && [10].includes(type);

  const visualizarDist = (type?: number) =>
    type !== undefined && [4, 5, 10].includes(type);

  const bloqueioUserComum = (type?: number) =>
    type !== undefined && [1, 3, 4, 5, 10].includes(type);

  const handleTetoClick = (id: number) => setSelectedTetoId(id);

  {
    /* INICIO INSETIR TETO */
  }
  const [modalAberto, setModalAberto] = useState(false);
  const [tetoSelecionado, setTetoSelecionado] = useState<any | null>(null);

  // Salvar (criar ou editar)
  const handleSalvarEdicao = async () => {
    try {
      const method = tetoSelecionado?.id ? "PUT" : "POST";
      const url = tetoSelecionado?.id
        ? `/api/pjesteto/${tetoSelecionado.id}`
        : `/api/pjesteto`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tetoSelecionado),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao salvar.");
        return;
      }

      // Atualiza lista
      if (method === "POST") {
        setPjestetos((prev) => [...prev, data]);
      } else {
        setPjestetos((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      }

      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao salvar teto:", error);
      alert("Erro ao salvar.");
    }
  };

  // Excluir teto
  const handleExcluir = async () => {
    if (!tetoSelecionado?.id) return;

    const confirm = window.confirm("Deseja realmente excluir este teto?");
    if (!confirm) return;

    try {
      const res = await fetch(`/api/pjesteto/${tetoSelecionado.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao excluir.");
        return;
      }

      setPjestetos((prev) => prev.filter((t) => t.id !== tetoSelecionado.id));

      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao excluir teto:", error);
      alert("Erro ao excluir.");
    }
  };

  // Criar novo (abre modal vazio)
  const handleNovoTeto = () => {
    setTetoSelecionado({
      nomeVerba: "",
      codVerba: "",
      tetoOf: 0,
      tetoPrc: 0,
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      statusTeto: "NAO ENVIADO",
      statusPg: "PENDENTE",
    });
    setModalAberto(true);
  };

  {
    /* FIM INSETIR TETO */
  }

  // Carrega automaticamente dados do ano atual
  useEffect(() => {
    const mesAtual = new Date().getMonth() + 1;

    if (user?.typeUser !== 2) {
      carregar({ ano: anoFiltro, mes: mesAtual });
      carregarResumo({ ano: anoFiltro, mes: String(mesAtual) });
      carregarDadosDist();
    } else {
      // Garante que pjestetos seja sempre um array vazio ao invés de undefined
      setPjestetos([]);
    }

    setMesFiltro(String(mesAtual));
  }, [user]);

  // Atualiza teto selecionado sempre que muda
  useEffect(() => {
    if (tetos.length > 0) setSelectedTetoId(tetos[0].id);
    setPjestetos(tetos);
  }, [tetos]);

  const tetosExibidos = useMemo(() => {
    const lista = Array.isArray(pjestetos) ? pjestetos : [];

    const mesAtual = new Date().getMonth() + 1;

    if (mesFiltro === "") {
      const agregadosMap = new Map();

      for (const item of lista) {
        if (item.mes > mesAtual) continue;

        const key = item.codVerba;

        if (!agregadosMap.has(key)) {
          agregadosMap.set(key, {
            codVerba: item.codVerba,
            nomeVerba: item.nomeVerba,
            imagemUrl: item.imagemUrl,
            tetoOf: 0,
            ttCotaOfDisponivelDistribuir: 0,
            ttCotaOfSaldo: 0,
            tetoPrc: 0,
            ttCotaPrcDisponivelDistribuir: 0,
            ttCotaPrcSaldo: 0,
            id: item.id,
          });
        }

        const grupo = agregadosMap.get(key);
        grupo.tetoOf += item.tetoOf || 0;
        grupo.ttCotaOfDisponivelDistribuir +=
          item.ttCotaOfDisponivelDistribuir || 0;
        grupo.ttCotaOfSaldo += item.ttCotaOfSaldo || 0;
        grupo.tetoPrc += item.tetoPrc || 0;
        grupo.ttCotaPrcDisponivelDistribuir +=
          item.ttCotaPrcDisponivelDistribuir || 0;
        grupo.ttCotaPrcSaldo += item.ttCotaPrcSaldo || 0;
      }

      return Array.from(agregadosMap.values());
    }

    return lista;
  }, [mesFiltro, pjestetos]);

  const handlePesquisar = () => {
    const ano = anoFiltro;
    const mes = mesFiltro ? parseInt(mesFiltro) : undefined;

    carregar({ ano, mes, diretoria: diretoriaFiltro || undefined });
    carregarResumo({ ano, mes: mesFiltro });
    carregarDadosDist();
  };

  const carregarDadosDist = async () => {
    try {
      const query = new URLSearchParams({
        ano: anoFiltro,
        mes: mesFiltro || String(new Date().getMonth() + 1),
      });

      const res = await fetch(`/api/pjesdist?${query.toString()}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data) && data.length > 0) {
        setDadosDist(data[0]); // Pegando o primeiro (ou adapte conforme sua lógica)
      } else {
        setDadosDist(null);
      }
    } catch (error) {
      console.error("Erro ao carregar PJESDIST:", error);
      setDadosDist(null);
    }
  };

  const selectedTeto = useMemo(() => {
    return tetosExibidos.find((t) => t.id === selectedTetoId);
  }, [selectedTetoId, tetosExibidos]);

  const resumoFiltrado = useMemo(() => {
    if (!Array.isArray(resumo)) return [];

    if (!selectedTeto) return resumo;

    return resumo
      .map((diretoria) => {
        const omesFiltradas = diretoria.omes.filter(
          (ome: any) => ome.codVerba === selectedTeto.codVerba
        );

        return omesFiltradas.length > 0
          ? { ...diretoria, omes: omesFiltradas }
          : null;
      })
      .filter(Boolean);
  }, [resumo, selectedTeto]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    handleResize(); // chama na montagem
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalAutorizadas = useMemo(() => {
    return resumoFiltrado.reduce((total, diretoria) => {
      return (
        total +
        diretoria.omes.reduce(
          (somaOme: number, ome: any) => somaOme + (ome.autorizadas || 0),
          0
        )
      );
    }, 0);
  }, [resumoFiltrado]);
  const percentualAutorizadas = useMemo(() => {
    let totalEscalas = 0;
    let totalAut = 0;

    resumoFiltrado.forEach((diretoria) => {
      diretoria.omes.forEach((ome) => {
        const aut = ome.autorizadas || 0;
        const hom = ome.homologadas || 0;
        const pend = ome.pendentes || 0;

        totalAut += aut;
        totalEscalas += aut + hom + pend;
      });
    });

    return totalEscalas === 0 ? 0 : Math.round((totalAut / totalEscalas) * 100);
  }, [resumoFiltrado]);

  return (
    <div className={styles.divReturn}>
      {loading ? (
        <p>Carregando dados... </p>
      ) : (
        <div className={styles.divTetoPrincipal}>
          <div className={styles.divTetoSecundaria}>
            <div className={styles.logoDashboard} onClick={handleNovoTeto}>
              <Image
                src="/assets/images/logo_dpo.png"
                alt="logo"
                width={60}
                height={40}
              />

              <div style={{ display: "block", marginTop: "5px" }}>
                <h3 className={styles.tituloH3Dashboard}>
                  <strong>GENESIS | DPO</strong>
                </h3>
                <h3 className={styles.tituloH3Dashboard}>
                  <strong>SISTEMA DE CONTROLE - PRODUÇÃO</strong>
                </h3>
                <h3 className={styles.tituloH3Dashboard}>
                  <strong>POLICIA MILITAR DE PERNAMBUCO</strong>
                </h3>
              </div>
            </div>
            {/* INICIO SELECT FILTROS */}

            <div className={styles.divFiltro}>
              <div className={styles.anoMes}>
                <div className={styles.labelInput}>
                  <label>Mês</label>
                  <br />
                </div>

                <select
                  className={styles.selectInput}
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(e.target.value)}
                >
                  <option value="">Todos</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i)
                        .toLocaleString("pt-BR", { month: "short" })
                        .toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.anoMes}>
                <div className={styles.labelInput}>
                  <label>Ano</label>
                  <br />
                </div>
                <select
                  className={styles.selectInput}
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(e.target.value)}
                >
                  {[2030, 2029, 2028, 2027, 2026, 2025].map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.divBotaoPesquisar}>
                <button
                  className={styles.buttonPesquisarDashboard}
                  onClick={handlePesquisar}
                >
                  Filtrar
                </button>
              </div>
            </div>
            {/* FIM SELECT FILTROS*/}
          </div>

          <div className={styles.tituloPjes}>
            <h3
              style={{
                borderBottom: "1px solid #d4d1d1",
              }}
            >
              <strong>PJES</strong>
            </h3>
          </div>

          {bloqueioUserComum(user?.typeUser) && (
            <ul className={styles.ulTeto}>
              {tetosExibidos.map((teto) => (
                <li
                  key={teto.id}
                  onClick={() => handleTetoClick(teto.id)}
                  className={`${styles.liTeto} ${
                    selectedTetoId === teto.id
                      ? styles.selected
                      : styles.notSelected
                  }`}
                >
                  <Image
                    width={selectedTetoId === teto.id ? 60 : 45}
                    height={selectedTetoId === teto.id ? 60 : 45}
                    src={teto.imagemUrl || "/assets/images/logo.png"}
                    alt="logo"
                    className={`${styles.imageTeto} ${
                      selectedTetoId === teto.id
                        ? styles.imageSelecionada
                        : styles.imageNaoSelecionada
                    }`}
                  />

                  <div className={styles.divNomeVerba}>
                    <strong>{teto.nomeVerba}</strong>
                  </div>

                  {visualizarDist(user?.typeUser) && (
                    <>
                      <div className={styles.divDistribuicaoCotas}></div>
                      <div className={styles.divDistribuicaoCotas}></div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* INICIO INFO DE CONSUMO GERAL */}

          {(user?.typeUser === 4 ||
            user?.typeUser === 5 ||
            user?.typeUser === 10) &&
            selectedTeto && (
              <div className={styles.divConsumoWrapper}>
                {/* ITEM 01 */}
                <div className={styles.divItem}>
                  <div className={styles.divItensConsumo}>
                    <div style={{ fontSize: "14px", color: "#949090" }}>
                      Previsto Mes / Anual (até mês atual)
                    </div>
                    <div style={{ fontSize: "20px", color: "#494848" }}>
                      <strong>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          selectedTeto.tetoOf * 300 + selectedTeto.tetoPrc * 200
                        )}
                      </strong>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Oficiais:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        {selectedTeto.tetoOf} Cota(s) ------- Saldo:{" "}
                        <strong>
                          {" "}
                          {
                            selectedTeto.ttCotaOfDisponivelDistribuir
                          } Cota(s){" "}
                        </strong>
                      </span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Praças:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        {selectedTeto.tetoPrc} Cota(s) ------- Saldo:{" "}
                        <strong>
                          {selectedTeto.ttCotaPrcDisponivelDistribuir} Cota(s){" "}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className={styles.divIconeConsumo}>
                    <PiChartLineUpBold />
                  </div>
                </div>

                {/* ITEM 02 */}

                <div className={styles.divItem}>
                  <div className={styles.divItensConsumo}>
                    <div style={{ fontSize: "14px", color: "#949090" }}>
                      Executado Mes / Anual (até mês atual)
                    </div>
                    <div style={{ fontSize: "20px", color: "#494848" }}>
                      <strong>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          (selectedTeto.tetoOf - selectedTeto.ttCotaOfSaldo) *
                            300 +
                            (selectedTeto.tetoPrc -
                              selectedTeto.ttCotaPrcSaldo) *
                              200
                        )}
                      </strong>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Oficiais:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        <strong>
                          {selectedTeto.tetoOf - selectedTeto.ttCotaOfSaldo}{" "}
                          Cota(s){" "}
                        </strong>
                      </span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Praças:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        <strong>
                          {selectedTeto.tetoPrc - selectedTeto.ttCotaPrcSaldo}{" "}
                          Cota(s){" "}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className={styles.divIconeConsumo}>
                    <PiChartLineDownBold />
                  </div>
                </div>

                {/* ITEM 03 */}
                <div className={styles.divItem}>
                  <div className={styles.divItensConsumo}>
                    <div style={{ fontSize: "14px", color: "#949090" }}>
                      Saldo Mes / Anual (Remanescente)
                    </div>
                    <div style={{ fontSize: "20px", color: "#484849" }}>
                      <strong>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          selectedTeto.ttCotaOfSaldo * 300 +
                            selectedTeto.ttCotaPrcSaldo * 200
                        )}
                      </strong>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Oficiais:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        <strong> {selectedTeto.ttCotaOfSaldo} Cota(s) </strong>
                      </span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <label className={styles.labelItensConsumo}>
                        Praças:
                      </label>
                      <span className={styles.spamItensConsumo}>
                        <strong> {selectedTeto.ttCotaPrcSaldo} Cota(s) </strong>
                      </span>
                    </div>
                  </div>
                  <div className={styles.divIconeConsumo}>
                    <MdAttachMoney />
                  </div>
                </div>

                {/* ITEM 04 */}
                <div className={styles.divItem}>
                  <div className={styles.divItensConsumo}>
                    <div style={{ fontSize: "14px", color: "#949090" }}>
                      Checagem Pendente
                    </div>
                    <div
                      style={{
                        fontSize: "40px",
                        color: "#494848",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <strong>{totalAutorizadas}</strong>
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      <strong>{percentualAutorizadas}%</strong>
                    </div>
                  </div>
                  <div className={styles.divIconeConsumo}>
                    <FaListCheck />
                  </div>
                </div>
              </div>
            )}
          {/* FIM INFO DE CONSUMO GERAL */}

          {/* INICIO INFO DE CONSUMO DIRETORIAS */}
          {user?.typeUser === 3 && (
            <div className={styles.divConsumoWrapper}>
              {/* ITEM 01 */}
              <div className={styles.divItem}>
                <div className={styles.divItensConsumo}>
                  <div style={{ fontSize: "14px", color: "#949090" }}>
                    Previsto Mes / Anual (até mês atual)
                  </div>
                  <div style={{ fontSize: "20px", color: "#494848" }}>
                    <strong>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        (dadosDist?.ttCotaOfEscala ?? 0) +
                          (dadosDist?.ttCotaOfSaldo ?? 0) * 300 +
                          (dadosDist?.ttCotaPrcEscala ?? 0) +
                          (dadosDist?.ttCotaPrcSaldo ?? 0) * 200
                      )}
                    </strong>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>
                      Oficiais:
                    </label>
                    <span className={styles.spamItensConsumo}>
                      {(dadosDist?.ttCotaOfEscala ?? 0) +
                        (dadosDist?.ttCotaOfSaldo ?? 0)}{" "}
                      Cota(s) ------- Saldo:{" "}
                      <strong>
                        {" "}
                        {dadosDist?.ttOfDistMenosEvento} Cota(s){" "}
                      </strong>
                    </span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>Praças:</label>
                    <span className={styles.spamItensConsumo}>
                      {(dadosDist?.ttCotaPrcEscala ?? 0) +
                        (dadosDist?.ttCotaPrcSaldo ?? 0)}{" "}
                      Cota(s) ------- Saldo:{" "}
                      <strong>
                        {dadosDist?.ttPrcDistMenosEvento} Cota(s){" "}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className={styles.divIconeConsumo}>
                  <PiChartLineUpBold />
                </div>
              </div>

              {/* ITEM 02 */}

              <div className={styles.divItem}>
                <div className={styles.divItensConsumo}>
                  <div style={{ fontSize: "14px", color: "#949090" }}>
                    Executado Mes / Anual (até mês atual)
                  </div>
                  <div style={{ fontSize: "20px", color: "#494848" }}>
                    <strong>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        dadosDist?.ttCotaOfEscala * 300 +
                          dadosDist?.ttCotaPrcEscala * 200
                      )}
                    </strong>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>
                      Oficiais:
                    </label>
                    <span className={styles.spamItensConsumo}>
                      <strong>{dadosDist?.ttCotaOfEscala} Cota(s) </strong>
                    </span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>Praças:</label>
                    <span className={styles.spamItensConsumo}>
                      <strong>{dadosDist?.ttCotaPrcEscala} Cota(s) </strong>
                    </span>
                  </div>
                </div>
                <div className={styles.divIconeConsumo}>
                  <PiChartLineDownBold />
                </div>
              </div>

              {/* ITEM 03 */}
              <div className={styles.divItem}>
                <div className={styles.divItensConsumo}>
                  <div style={{ fontSize: "14px", color: "#949090" }}>
                    Saldo Mes / Anual (Remanescente)
                  </div>
                  <div style={{ fontSize: "20px", color: "#484849" }}>
                    <strong>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        dadosDist?.ttCotaOfSaldo * 300 +
                          dadosDist?.ttCotaPrcSaldo * 200
                      )}
                    </strong>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>
                      Oficiais:
                    </label>
                    <span className={styles.spamItensConsumo}>
                      <strong> {dadosDist?.ttCotaOfSaldo} Cota(s) </strong>
                    </span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <label className={styles.labelItensConsumo}>Praças:</label>
                    <span className={styles.spamItensConsumo}>
                      <strong> {dadosDist?.ttCotaPrcSaldo} Cota(s) </strong>
                    </span>
                  </div>
                </div>
                <div className={styles.divIconeConsumo}>
                  <MdAttachMoney />
                </div>
              </div>

              {/* ITEM 04 */}
              <div className={styles.divItem}>
                <div className={styles.divItensConsumo}>
                  <div style={{ fontSize: "14px", color: "#949090" }}>
                    Checagem Pendente
                  </div>
                  <div
                    style={{
                      fontSize: "40px",
                      color: "#494848",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <strong>{totalAutorizadas}</strong>
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    <strong>{percentualAutorizadas}%</strong>
                  </div>
                </div>
                <div className={styles.divIconeConsumo}>
                  <FaListCheck />
                </div>
              </div>
            </div>
          )}
          {/* FIM INFO DE CONSUMO DIRETORIAS */}

          <div className={styles.divGraficoWrapper}>
            {/* INICIO GRAFICO DE CONSUMO */}
            {bloqueioUserComum(user?.typeUser) && (
              <div className={styles.divGraficoEsquerda}>
                <div className={styles.divGrafico}>
                  <span
                    style={{
                      fontSize: "20px",
                      borderBottom: "1px solid #ffffff",
                      display: "block",
                      color: "#ffffff",
                      marginBottom: "1rem",
                    }}
                  >
                    DISTRIBUIÇÃO E CONSUMO
                  </span>

                  <div className={styles.graficoContainer}>
                    {resumoFiltrado && resumoFiltrado.length > 0 ? (
                      <div
                        style={{
                          height: `${
                            resumoFiltrado.flatMap((d) => d.omes).length * 40
                          }px`, // ← altura dinâmica (40px por barra)
                          minHeight: "100%", // ← evita que ele fique menor que o container
                        }}
                      >
                        <Bar
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: "y" as const,
                            plugins: {
                              legend: {
                                display: !isSmallScreen, // <-- só exibe se não for tela pequena
                                position: "right",
                                labels: {
                                  color: "#ffffff",
                                  font: {
                                    weight: "bold",
                                  },
                                  boxWidth: 20,
                                },
                              },
                              tooltip: {
                                callbacks: {
                                  label: function (context) {
                                    const previsto =
                                      context.chart.data.datasets?.[0]?.data?.[
                                        context.dataIndex
                                      ];
                                    const restante =
                                      context.chart.data.datasets?.[1]?.data?.[
                                        context.dataIndex
                                      ];
                                    const valor = context.raw;

                                    const executadoNum =
                                      typeof previsto === "number"
                                        ? previsto
                                        : 0;
                                    const restanteNum =
                                      typeof restante === "number"
                                        ? restante
                                        : 0;
                                    const total = executadoNum + restanteNum;

                                    if (
                                      typeof valor === "number" &&
                                      total > 0
                                    ) {
                                      const porcentagem = (
                                        (valor / total) *
                                        100
                                      ).toFixed(1);
                                      return `${context.dataset.label}: ${valor} (${porcentagem}%)`;
                                    } else {
                                      return `${context.dataset.label}: ${valor}`;
                                    }
                                  },
                                },
                              },
                              datalabels: {
                                display: (ctx) => ctx.datasetIndex === 0, // só na barra verde
                                align: "end",
                                anchor: "end",
                                formatter: (value, context) => {
                                  const total =
                                    value +
                                    context.chart.data.datasets[1].data[
                                      context.dataIndex
                                    ];
                                  const percent = (
                                    (value / total) *
                                    100
                                  ).toFixed(0);
                                  return `${percent}%`;
                                },
                                color: "#000000",
                                font: {
                                  weight: "bold",
                                },
                              },
                            },
                            scales: {
                              x: {
                                stacked: true,
                                ticks: {
                                  display: false, // <- ISSO remove os números 1, 2, 3...
                                },

                                grid: {
                                  display: false, // (opcional) remove a grade de fundo também
                                },
                              },
                              y: {
                                stacked: true,
                                ticks: {
                                  color: "#ffffff", // ⬅️ Altere aqui a cor dos nomes das OMEs
                                  font: {
                                    size: 14,
                                    weight: "bold",
                                  },
                                },
                              },
                            },
                          }}
                          data={{
                            labels: resumoFiltrado.flatMap((diretoria) =>
                              diretoria.omes.map((ome: any) => `${ome.ome}`)
                            ),
                            datasets: [
                              {
                                label: "Executado",
                                data: resumoFiltrado.flatMap((d) =>
                                  d.omes.map(
                                    (ome: any) =>
                                      (ome.ttCotaOf || 0) + (ome.ttCotaPrc || 0)
                                  )
                                ),
                                backgroundColor: "rgba(62, 179, 62, 0.9)", // verde
                                stack: "total",
                              },
                              {
                                label: "Previsto",
                                data: resumoFiltrado.flatMap((d) =>
                                  d.omes.map((ome: any) => {
                                    const previsto =
                                      (ome.pjesOfEvento || 0) +
                                      (ome.pjesPrcEvento || 0);
                                    const executado =
                                      (ome.ttCotaOf || 0) +
                                      (ome.ttCotaPrc || 0);
                                    const restante = previsto - executado;
                                    return restante > 0 ? restante : 0;
                                  })
                                ),
                                backgroundColor: "rgb(243, 238, 238)", // cinza
                                stack: "total",
                              },
                            ],
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center", // centraliza nos dois eixos
                          height: "100%",
                          minHeight: "350px",
                        }}
                      >
                        <FaChartSimple size={200} color="#adcbc38b" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* FIM GRAFICO DE CONSUMO */}

            {/* INICIO AREA DO ResumoPorOme */}
            {bloqueioUserComum(user?.typeUser) && (
              <div className={styles.divGraficoDireita}>
                <span
                  style={{
                    fontSize: "18px",
                    borderBottom: "1px solid #e7dada",
                    display: "block",
                  }}
                >
                  ANALISE POR DIRETORIA
                </span>

                {loadingResumo ? (
                  <p>Carregando resumo...</p>
                ) : (
                  <div className={styles.tabelaFixada}>
                    <table className={styles["tabela-zebra-ome"]}>
                      <thead>
                        <tr>
                          <th>Unidade</th>
                          <th>Oficiais</th>
                          <th>Praças</th>
                          <th>
                            <FaTriangleExclamation />
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <div className={styles.scrollTabela}>
                      <table className={styles["tabela-zebra-ome"]}>
                        <tbody>
                          {resumoFiltrado.map((diretoria, idx) => (
                            <React.Fragment key={idx}>
                              <tr
                                style={{
                                  backgroundColor: "#ffffff",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                }}
                              >
                                <td colSpan={4}>{diretoria.nomeDiretoria}</td>
                              </tr>
                              {diretoria.omes.map(
                                (ome: any, omeIdx: number) => (
                                  <tr key={omeIdx}>
                                    <td>{ome.ome}</td>
                                    <td>
                                      {ome.pjesOfEvento} | {ome.ttCotaOf}
                                    </td>
                                    <td>
                                      {ome.pjesPrcEvento} | {ome.ttCotaPrc}
                                    </td>
                                    <td>{ome.autorizadas}</td>
                                  </tr>
                                )
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* FIM AREA DO ResumoPorOme */}

            {/* INICIO PAGAMENTO DA VERBA */}
            <div className={styles.divGraficoDireita}>
              <span className={styles.tituloPagamento}>
                PROCESSO DE PAGAMENTO
              </span>
              <div>
                {Array.isArray(pjestetos) &&
                  pjestetos.map((teto, i) => {
                    const dataPrestacao = teto.createdAtStatusTeto
                      ? new Date(teto.createdAtStatusTeto).toLocaleString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : null;

                    const dataPagamento = teto.createdAtStatusPg
                      ? new Date(teto.createdAtStatusPg).toLocaleString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : null;

                    const statusPagamentoRealizado = teto.statusPg === "PAGO";
                    const desativado = teto.tetoOf === 0 && teto.tetoPrc === 0;

                    return (
                      <div
                        key={teto.id || i}
                        className={styles.cardPagamento}
                        onClick={() => {
                          setTetoSelecionado(teto);
                          setModalAberto(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.logoContainer}>
                          <Image
                            src={
                              teto.imagemUrl || "/assets/images/logo_dpo.png"
                            }
                            alt="logo"
                            width={40}
                            height={40}
                            className={`${styles.logoImagem} ${
                              desativado ? styles.logoImagemOpaca : ""
                            }`}
                          />
                        </div>

                        <div className={styles.infoContainerVerba}>
                          <div>
                            <strong>{`PJES ${teto.nomeVerba}`}</strong>
                          </div>

                          {desativado ? (
                            <>
                              <div className={styles.statusDesativado}>
                                Prestação de Contas:{" "}
                                <strong>Não Ativado</strong>
                              </div>
                              <div className={styles.statusDesativado}>
                                Status do Pagamento:{" "}
                                <strong>Não Ativado</strong>
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className={
                                  teto.statusTeto === "ENVIADO"
                                    ? styles.statusPago
                                    : styles.statusPendenteCodVerba
                                }
                              >
                                Prestação de Contas:{" "}
                                <strong>
                                  {teto.statusTeto === "ENVIADO" &&
                                  dataPrestacao
                                    ? `ENVIADA em ${dataPrestacao}`
                                    : "NÃO ENVIADA"}
                                </strong>
                              </div>

                              <div
                                className={
                                  statusPagamentoRealizado
                                    ? styles.statusPago
                                    : styles.statusPendenteCodVerba
                                }
                              >
                                Status do Pagamento:{" "}
                                <strong>
                                  {statusPagamentoRealizado && dataPagamento
                                    ? `REALIZADO em ${dataPagamento}`
                                    : "PENDENTE"}
                                </strong>
                              </div>
                            </>
                          )}
                        </div>

                        <div className={styles.iconeContainer}>
                          {desativado ? (
                            <FaLock color="gray" />
                          ) : statusPagamentoRealizado ? (
                            <FaCheck color="#0cc961" />
                          ) : (
                            <FaTriangleExclamation color="#ee8834" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* MODAL TETO PJES */}

                {apenasMaster(user?.typeUser) &&
                  modalAberto &&
                  tetoSelecionado && (
                    <div className={styles.modalOverlayDashboard}>
                      <div className={styles.modalContent}>
                        <h3>Editar Verba - {tetoSelecionado.nomeVerba}</h3>

                        <label>Nome Verba:</label>
                        <input
                          type="text"
                          value={tetoSelecionado.nomeVerba}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              nomeVerba: e.target.value,
                            })
                          }
                        />

                        <label>Código Verba:</label>
                        <input
                          type="number"
                          value={tetoSelecionado.codVerba}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              codVerba: Number(e.target.value),
                            })
                          }
                        />

                        <label>Teto OF:</label>
                        <input
                          type="number"
                          value={tetoSelecionado.tetoOf}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              tetoOf: Number(e.target.value),
                            })
                          }
                        />

                        <label>Teto PRC:</label>
                        <input
                          type="number"
                          value={tetoSelecionado.tetoPrc}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              tetoPrc: Number(e.target.value),
                            })
                          }
                        />

                        <label>Mês:</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={tetoSelecionado.mes}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              mes: Number(e.target.value),
                            })
                          }
                        />

                        <label>Ano:</label>
                        <input
                          type="number"
                          value={tetoSelecionado.ano}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              ano: Number(e.target.value),
                            })
                          }
                        />

                        <label>Status da Prestação:</label>
                        <select
                          value={tetoSelecionado.statusTeto}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              statusTeto: e.target.value,
                            })
                          }
                        >
                          <option value="ENVIADO">ENVIADO</option>
                          <option value="NAO ENVIADO">NÃO ENVIADO</option>
                        </select>

                        <label>Status do Pagamento:</label>
                        <select
                          value={tetoSelecionado.statusPg}
                          onChange={(e) =>
                            setTetoSelecionado({
                              ...tetoSelecionado,
                              statusPg: e.target.value,
                            })
                          }
                        >
                          <option value="PAGO">PAGO</option>
                          <option value="PENDENTE">PENDENTE</option>
                        </select>

                        <div
                          style={{
                            marginTop: "1rem",
                            display: "flex",
                            gap: "1rem",
                          }}
                        >
                          {tetoSelecionado?.id && (
                            <button
                              onClick={handleExcluir}
                              style={{ backgroundColor: "red", color: "white" }}
                            >
                              Excluir
                            </button>
                          )}
                          <button onClick={() => setModalAberto(false)}>
                            Cancelar
                          </button>
                          <button onClick={handleSalvarEdicao}>Salvar</button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* MODAL TETO PJES */}
              </div>
            </div>
            {/* FIM PAGAMENTO DA VERBA */}
          </div>

          <div className={styles.tituloDiaria}>
            <h3
              style={{
                borderBottom: "1px solid #d4d1d1",
              }}
            >
              <strong>DIARIAS</strong>
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
