"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PiChartLineDownBold, PiChartLineUpBold } from "react-icons/pi";
import styles from "../privateLayout.module.css";
import { MdAttachMoney } from "react-icons/md";
import {FaListCheck} from "react-icons/fa6";

import {
  FaChartSimple,
  FaTriangleExclamation,
} from "react-icons/fa6";
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
import {FaCheck, FaLock } from "react-icons/fa";
import { useUser } from "@/app/context/UserContext";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  ChartDataLabels,
  Legend
);

interface Evento {
  id: number;
  nomeEvento: string;
  nomeOme:string;
  ttCtOfEvento: number;
  ttCtPrcEvento: number;
}

interface EventosPorOme {
  id: number;
  nomeOme: string;
  diretoriaId: number;
  eventos: Evento[];
  SomattCtOfEscala?: number;
  SomattCtPrcEscala?: number;
}

type Ome = {
  id: number;
  nomeOme: string;
  diretoriaId: number;
  SomattCtOfEvento?: string;
  SomattCtPrcEvento?: string;
  SomattCtOfEscala?: string;
  SomattCtPrcEscala?: string;
};



export default function Dashboard() {
  const user = useUser();
  const [tetos, setTetos] = useState<any[]>([]);
  const [loadingTetos, setLoadingTetos] = useState(true);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [totalSomaCtOfExec, setTotalSomaCtOfExec] = useState<number>(0);
  const [totalSomaCtPrcExec, setTotalSomaCtPrcExec] = useState<number>(0);
  const apenasMaster = (type?: number) => type !== undefined && [10].includes(type);
  const now = new Date();
  const [anoSelecionado, setAnoSelecionado] = useState<number>(now.getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number>(now.getMonth() + 1);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [expandedDiretorias, setExpandedDiretorias] = useState<number[]>([]);
  const [omesPorDiretoria, setOmesPorDiretoria] = useState<Record<number, Ome[]>>({});
  const [loadingDiretorias, setLoadingDiretorias] = useState<number[]>([]);
  const [diretoriaGraficoId, setDiretoriaGraficoId] = useState<number | null>(null);
  const [eventos, setEventos] = useState<EventosPorOme | null>(null);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const temEventosValidos = eventos !== null && Array.isArray(eventos.eventos) && eventos.eventos.length > 0;

  
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    handleResize(); // chama na montagem
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carrega lista de tetos ao montar ou quando mudar ano/mês
  useEffect(() => {
    async function fetchTetos() {
      setLoadingTetos(true);
      try {
        const res = await fetch(`/api/pjesteto?ano=${anoSelecionado}&mes=${mesSelecionado}`);
        if (!res.ok) throw new Error("Erro ao buscar tetos");
        const data = await res.json();
        setTetos(data);
        setTetoSelecionado(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTetos(false);
      }
    }

    fetchTetos();
  }, [anoSelecionado, mesSelecionado]);

  const handleTetoClick = async (id: number) => {
    setLoadingDetalhes(true);
    try {
      const res = await fetch(`/api/pjesteto/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar detalhes do teto");
      const data = await res.json();
  
      setTetoSelecionado(data);
      const distribs = data.distribuições || [];
      const totalOfExec = distribs.reduce(
        (acc: number, dist: any) => acc + Number(dist.SomaCtOfExec || 0),
        0
      );

      const totalPrcExec = distribs.reduce(
        (acc: number, dist: any) => acc + Number(dist.SomaCtPrcExec || 0),
        0
      );

      setTotalSomaCtOfExec(totalOfExec);
      setTotalSomaCtPrcExec(totalPrcExec);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetalhes(false);
    }
  };


  useEffect(() => {
    async function fetchEventos() {
      if (!user?.omeId) return;
  
      setLoadingEventos(true);
      try {
        const res = await fetch(`/api/pjesevento?omeId=${user.omeId}&ano=${anoSelecionado}&mes=${mesSelecionado}`);
        if (!res.ok) throw new Error("Erro ao buscar eventos");
  
        const data = await res.json();
        setEventos(data);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEventos(false);
      }
    }
  
    fetchEventos();
  }, [user, anoSelecionado, mesSelecionado]);
  

  /* INICIO INSETIR TETO */
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
          setTetos((prev) => [...prev, data]);
        } else {
          setTetos((prev) => prev.map((t) => (t.id === data.id ? data : t)));
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
        setTetos((prev) => prev.filter((t) => t.id !== tetoSelecionado.id));
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

  /* FIM INSETIR TETO */
  
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const anos = [2023, 2024, 2025, 2026];

  const handleDiretoriaClick = async (diretoriaId: number) => {
    const isExpanded = expandedDiretorias.includes(diretoriaId);
    if (isExpanded) {
      setExpandedDiretorias((prev) => prev.filter((id) => id !== diretoriaId));
      setDiretoriaGraficoId(null);
      return;
    }
    
    // Se ainda não carregou os dados, busca da API
    if (!omesPorDiretoria[diretoriaId]) {
      try {
        setLoadingDiretorias((prev) => [...prev, diretoriaId]);
  
        const codVerba = tetoSelecionado?.codVerba;
  
        const url = new URL(`/api/diretoria/${diretoriaId}`, window.location.origin);
        url.searchParams.append("mes", String(mesSelecionado));
        url.searchParams.append("ano", String(anoSelecionado));
        if (codVerba) url.searchParams.append("codVerba", String(codVerba));
  
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Erro ao buscar OMEs da diretoria");
        const data = await res.json();
        setOmesPorDiretoria((prev) => ({ ...prev, [diretoriaId]: data.omes }));
  
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDiretorias((prev) => prev.filter((id) => id !== diretoriaId));
      }
    }
    setDiretoriaGraficoId(diretoriaId);  
    // Expande a diretoria
    setExpandedDiretorias((prev) => [...prev, diretoriaId]);
  };
  

    
  return (
  <div className={styles.divReturn}>
    <div className={styles.divTetoPrincipal}>
        <div className={styles.divTetoSecundaria}>
          <div className={styles.logoDashboard}>
            <Image
              src="/assets/images/logo_dpo.png"
              alt="logo"
              width={70}
              height={40}
            />

            <div style={{ display: "block", marginTop: "5px", width:"100%" }}>
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
          
          {/* Filtros */}
          <div className={styles.divFiltro}>
            <div className={styles.anoMes} >
              <label className={styles.labelInput} htmlFor="mes">Mês:</label>
              <select
              className={styles.selectInput}
                id="mes"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
              >
                {meses.map((nome, index) => (
                  <option key={index + 1} value={index + 1}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.anoMes}>
              <label className={styles.labelInput} htmlFor="ano">Ano:</label>
              <select
              className={styles.selectInput}
                id="ano"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              >
                {anos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
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

          {/* Lista de Tetos */}
          {loadingTetos ? (
            <p>Carregando tetos...</p>
          ) : (
            <div className={styles.divTetoPrincipal}>
              <ul className={styles.ulTeto}>
                {tetos.map((teto) => {
                  const isSelected = tetoSelecionado?.id === teto.id;
                  return (
                    <li
                      key={teto.id}
                      onClick={() => handleTetoClick(teto.id)}
                      className={`${styles.liTeto} ${isSelected ? styles.selected : styles.notSelected}`}
                    >
                      <Image
                        src={teto.imagemUrl}
                        alt={teto.nomeVerba}
                        width={isSelected ? 60 : 45}
                        height={isSelected ? 60 : 45}
                        className={`${styles.imageTeto} ${
                          isSelected ? styles.imageSelecionada : styles.imageNaoSelecionada
                        }`}
                      />

                      <strong>{teto.nomeVerba}</strong>
                    </li>
                  );
                })}
              </ul>

              {/* Detalhes do teto selecionado */}
              {loadingDetalhes ? (
                <p>Carregando detalhes...</p>
              ) : (

                  tetoSelecionado && (
                  <div className={styles.divConsumoWrapper}>
                  {user?.typeUser !== 1 && user?.typeUser !== 2 && user?.typeUser !== 3 && (
                    <div className={styles.divItemPrincipal}>

                        {/* INICIO ITEM 01 */}
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
                                  tetoSelecionado.tetoOf * 300 + tetoSelecionado.tetoPrc * 200
                                )}
                              </strong>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>
                                Oficiais:
                              </label>
                              <span className={styles.spamItensConsumo}>
                                {tetoSelecionado.tetoOf} Cota(s) ------- Saldo:{" "}
                                <strong>
                                  {tetoSelecionado.tetoOf - tetoSelecionado.distribuições?.reduce(
                                (acc: number, d: any) => acc + d.SomattCtOfDist,
                                0
                              )} Cota(s){" "} 
                                </strong>
                              </span>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>
                                Praças:
                              </label>
                              <span className={styles.spamItensConsumo}>
                                {tetoSelecionado.tetoPrc} Cota(s) ------- Saldo:{" "}
                                <strong>
                                  {tetoSelecionado.tetoPrc - tetoSelecionado.distribuições?.reduce(
                                (acc: number, d: any) => acc + d.SomattCtPrcDist,
                                0
                              )} Cota(s){" "}
                                </strong>
                              </span>
                            </div>
                          </div>
                          <div className={styles.divIconeConsumo}>
                            <PiChartLineUpBold />
                          </div>
                        </div>
                        {/* FIM ITEM 01 */}

                        {/* INICIO ITEM 02 */}
                        <div className={styles.divItem}>
                          <div className={styles.divItensConsumo}>
                            <div style={{ fontSize: "14px", color: "#949090" }}>
                              Executado Mês / Anual (até mês atual)
                            </div>
                            <div style={{ fontSize: "20px", color: "#494848" }}>
                              <strong>
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(
                                  totalSomaCtOfExec * 300 + totalSomaCtPrcExec * 200
                                )}
                              </strong>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>Oficiais:</label>
                              <span className={styles.spamItensConsumo}>
                                <strong>{totalSomaCtOfExec} Cota(s)</strong>
                              </span>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>Praças:</label>
                              <span className={styles.spamItensConsumo}>
                                <strong>{totalSomaCtPrcExec} Cota(s)</strong>
                              </span>
                            </div>
                          </div>
                          <div className={styles.divIconeConsumo}>
                            <PiChartLineDownBold />
                          </div>
                        </div>
                        {/* FIM ITEM 02 */}

                        {/* INICIO ITEM 03 */}
                        <div className={styles.divItem}>
                          <div className={styles.divItensConsumo}>
                            <div style={{ fontSize: "14px", color: "#949090" }}>
                              Saldo Mês / Remanescente
                            </div>
                            <div style={{ fontSize: "20px", color: "#494848" }}>
                              <strong>
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(
                                  (tetoSelecionado.tetoOf - totalSomaCtOfExec) * 300 +
                                  (tetoSelecionado.tetoPrc - totalSomaCtPrcExec) * 200
                                )}
                              </strong>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>
                                Oficiais:
                              </label>
                              <span className={styles.spamItensConsumo}>
                                <strong>
                                  {(tetoSelecionado.tetoOf - totalSomaCtOfExec)} Cota(s)
                                </strong>
                              </span>
                            </div>
                            <div style={{ display: "flex" }}>
                              <label className={styles.labelItensConsumo}>
                                Praças:
                              </label>
                              <span className={styles.spamItensConsumo}>
                                <strong>
                                  {(tetoSelecionado.tetoPrc - totalSomaCtPrcExec)} Cota(s)
                                </strong>
                              </span>
                            </div>
                          </div>
                          <div className={styles.divIconeConsumo}>
                            <MdAttachMoney />
                          </div>
                        </div>
                        {/* FIM ITEM 03 */}

                        {/* INICIO ITEM 04 */}
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
                              <strong>0</strong>
                            </div>
                            <div style={{ fontSize: "14px" }}>
                              <strong>0%</strong>
                            </div>
                          </div>
                          <div className={styles.divIconeConsumo}>
                            <FaListCheck />
                          </div>
                        </div>
                        {/* FIM ITEM 04 */}
                    </div>
                  )}


                    <div className={styles.divGraficoWrapper}>
                      {/* INICIO GRAFICO DE CONSUMO */}
                      <div className={styles.divGraficoEsquerda}>
                      {user?.typeUser === 1 && temEventosValidos ? (
                        // 👉 Gráfico para typeUser === 1
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
                            CONSUMO POR EVENTO - {eventos?.nomeOme}
                          </span>
                          <div className={styles.graficoContainer}>
                            <Bar
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: "y",
                                plugins: {
                                  legend: {
                                    display: !isSmallScreen,
                                    position: "right",
                                    labels: {
                                      color: "#ffffff",
                                      font: { weight: "bold" },
                                      boxWidth: 20,
                                    },
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        const previsto = context.chart.data.datasets?.[1]?.data?.[context.dataIndex];
                                        const executado = context.chart.data.datasets?.[0]?.data?.[context.dataIndex];
                                        const valor = context.raw;

                                        const total = Number(previsto) + Number(executado);

                                        if (typeof valor === "number" && total > 0) {
                                          const porcentagem = ((valor / total) * 100).toFixed(1);
                                          return `${context.dataset.label}: ${valor} (${porcentagem}%)`;
                                        } else {
                                          return `${context.dataset.label}: ${valor}`;
                                        }
                                      },
                                    },
                                  },
                                  datalabels: {
                                    display: (ctx) => ctx.datasetIndex === 0,
                                    align: "end",
                                    anchor: "end",
                                    formatter: (value, context) => {
                                      const previsto = context.chart.data.datasets[1].data[context.dataIndex];
                                      const total = value + Number(previsto);
                                      const percent = ((value / total) * 100).toFixed(0);
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
                                    ticks: { display: false },
                                    grid: { display: false },
                                  },
                                  y: {
                                    stacked: true,
                                    ticks: {
                                      color: "#ffffff",
                                      font: {
                                        size: 14,
                                        weight: "bold",
                                      },
                                    },
                                  },
                                },
                              }}
                              data={{
                                labels: eventos?.eventos.map((evento: any) => evento.nomeEvento),
                                datasets: [
                                  {
                                    label: "Executado",
                                    data: eventos?.eventos.map((evento: any) =>
                                      (parseInt(evento.SomattCtOfEscala ?? 0) || 0) +
                                      (parseInt(evento.SomattCtPrcEscala ?? 0) || 0)
                                    ),
                                    backgroundColor: "rgba(62, 179, 62, 0.9)",
                                    stack: "total",
                                  },
                                  {
                                    label: "Previsto",
                                    data: eventos?.eventos.map((evento: any) =>
                                      (parseInt(evento.ttCtOfEvento ?? 0) || 0) +
                                      (parseInt(evento.ttCtPrcEvento ?? 0) || 0)
                                    ),
                                    backgroundColor: "rgb(243, 238, 238)",
                                    stack: "total",
                                  },
                                ],
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        // 👉 Gráfico para typeUser === 3, 4, 5, 10...
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
      {(tetoSelecionado?.distribuições?.length > 0 || diretoriaGraficoId) ? (
        <div
          style={{
            height: `${
              (diretoriaGraficoId
                ? omesPorDiretoria[diretoriaGraficoId]?.length || 0
                : tetoSelecionado.distribuições.length
              ) * 40
            }px`,
            minHeight: "100%",
          }}
        >
                                <Bar
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: "y",
                                    plugins: {
                                      legend: {
                                        display: !isSmallScreen,
                                        position: "right",
                                        labels: {
                                          color: "#ffffff",
                                          font: { weight: "bold" },
                                          boxWidth: 20,
                                        },
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: function (context) {
                                            const previsto = context.chart.data.datasets?.[0]?.data?.[context.dataIndex];
                                            const executado = context.chart.data.datasets?.[1]?.data?.[context.dataIndex];
                                            const valor = context.raw;

                                            const previstoNum = typeof previsto === "number" ? previsto : 0;
                                            const executadoNum = typeof executado === "number" ? executado : 0;
                                            const total = previstoNum + executadoNum;

                                            if (typeof valor === "number" && total > 0) {
                                              const porcentagem = ((valor / total) * 100).toFixed(1);
                                              return `${context.dataset.label}: ${valor} (${porcentagem}%)`;
                                            } else {
                                              return `${context.dataset.label}: ${valor}`;
                                            }
                                          },
                                        },
                                      },
                                      datalabels: {
                                        display: (ctx) => ctx.datasetIndex === 1,
                                        align: "end",
                                        anchor: "end",
                                        formatter: (value, context) => {
                                          const total =
                                            value +
                                            context.chart.data.datasets[0].data[context.dataIndex];
                                          const percent = ((value / total) * 100).toFixed(0);
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
                                        ticks: { display: false },
                                        grid: { display: false },
                                      },
                                      y: {
                                        stacked: true,
                                        ticks: {
                                          color: "#ffffff",
                                          font: {
                                            size: 14,
                                            weight: "bold",
                                          },
                                        },
                                      },
                                    },
                                  }}
                                  data={
                                    diretoriaGraficoId && omesPorDiretoria[diretoriaGraficoId]
                                      ? {
                                          labels: omesPorDiretoria[diretoriaGraficoId].map((ome: any) => ome.nomeOme),
                                          datasets: [
                                            {
                                              label: "Executado",
                                              data: omesPorDiretoria[diretoriaGraficoId].map(
                                                (ome: any) =>
                                                  (parseInt(ome.SomattCtOfEscala ?? 0) || 0) +
                                                  (parseInt(ome.SomattCtPrcEscala ?? 0) || 0)
                                              ),
                                              backgroundColor: "rgba(62, 179, 62, 0.9)",
                                              stack: "total",
                                            },
                                            {
                                              label: "Previsto",
                                              data: omesPorDiretoria[diretoriaGraficoId].map(
                                                (ome: any) =>
                                                  (parseInt(ome.SomattCtOfEvento ?? 0) || 0) +
                                                  (parseInt(ome.SomattCtPrcEvento ?? 0) || 0)
                                              ),
                                              backgroundColor: "rgb(243, 238, 238)",
                                              stack: "total",
                                            },
                                          ],
                                        }
                                      : {
                                          labels: tetoSelecionado.distribuições.map((dist: any) => dist.nomeDiretoria),
                                          datasets: [
                                            {
                                              label: "Executado",
                                              data: tetoSelecionado.distribuições.map(
                                                (dist: any) =>
                                                  (parseInt(dist.SomaCtOfExec ?? 0) || 0) +
                                                  (parseInt(dist.SomaCtPrcExec ?? 0) || 0)
                                              ),
                                              backgroundColor: "rgba(62, 179, 62, 0.9)",
                                              stack: "total",
                                            },
                                            {
                                              label: "Previsto",
                                              data: tetoSelecionado.distribuições.map(
                                                (dist: any) =>
                                                  (parseInt(dist.SomattCtOfDist ?? 0) || 0) +
                                                  (parseInt(dist.SomattCtPrcDist ?? 0) || 0)
                                              ),
                                              backgroundColor: "rgb(243, 238, 238)",
                                              stack: "total",
                                            },
                                          ],
                                        }
                                  }
                                />
                              </div>
                            ) : (
                              <div className={styles.divGraficoSecundariaInterna}>
                                <FaChartSimple size={200} color="#adcbc38b" />
                              </div>
                            )}
                          </div>
                        </div>
                        )}
                      </div>
                      {/* FIM GRAFICO DE CONSUMO */}
                      
                      {/* INICIO AREA CONSUMO POR DIRETORIA */}
                      <div className={styles.divGraficoDireita}>
                        <span className={styles.spanAnaliseDiretoria}>
                          ANALISE POR DIRETORIA e OME
                        </span>

                        {user?.typeUser === 1 ? (
                          (() => {
                            
                            return (
                              <div className={styles.tabelaFixada}>
                                <div className={styles.scrollTabela}>
                                  <table className={styles["tabela-zebra-ome"]}>
                                    <thead>
                                      <tr>
                                        <th>UNIDADE</th>
                                        <th>EVENTOS AUTORIZADOS</th>
                                        <th>OFICIAIS</th>
                                        <th>PRAÇAS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {eventos?.eventos && eventos.eventos.length > 0 ? (
                                        eventos.eventos.map((evento: any) => (
                                          <tr key={evento.id}>
                                            <td>{eventos.nomeOme}</td>
                                            <td>{evento.nomeEvento}</td>
                                            <td>{evento.ttCtOfEvento ?? 0}</td>
                                            <td>{evento.ttCtPrcEvento ?? 0}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                                            Nenhum evento registrado para essa OME neste período.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className={styles.tabelaFixada}>
                            <div className={styles.scrollTabela}>
                              <table className={styles["tabela-zebra-ome"]}>
                                <tbody>
                                  {tetoSelecionado.distribuições?.map((dist: any) => (
                                    <React.Fragment key={dist.diretoriaId}>
                                      {/* Linha principal da diretoria */}
                                      <tr>
                                        <td
                                          onClick={() => handleDiretoriaClick(dist.diretoriaId)}
                                          className={styles.tdDiretoria}
                                          style={{ fontSize: "20px" }}
                                        >
                                          {dist.nomeDiretoria}
                                        </td>
                                        <td className={styles.tdDiretoria} style={{ fontSize: "20px" }}>
                                          {dist.SomattCtOfDist} | {dist.SomaCtOfExec ?? "-"}
                                        </td>
                                        <td className={styles.tdDiretoria} style={{ fontSize: "20px" }}>
                                          {dist.SomattCtPrcDist} | {dist.SomaCtPrcExec ?? "-"}
                                        </td>
                                      </tr>

                                      {/* Sublinhas com OMEs associadas */}
                                      {expandedDiretorias.includes(dist.diretoriaId) &&
                                        omesPorDiretoria[dist.diretoriaId]?.map((ome: any) => (
                                          <tr key={ome.id}>
                                            <td>{ome.nomeOme}</td>
                                            <td> {ome.SomattCtOfEvento} | {ome.SomattCtOfEscala}</td>
                                            <td>{ome.SomattCtPrcEvento} | {ome.SomattCtPrcEscala}</td>
                                          </tr>
                                        ))}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* FIM AREA CONSUMO POR DIRETORIA */}

                      {/* INICIO PAGAMENTO DA VERBA */}
                      <div className={styles.divGraficoDireita}>
                        <span className={styles.tituloPagamento}>
                          PROCESSO DE PAGAMENTO
                        </span>
                        <div>
                          {Array.isArray(tetos) &&
                            tetos.map((teto, i) => {
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
                  </div>
                ))}
          </div>
          )}
    </div>
  </div>
  );
}
