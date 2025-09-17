"use client";

import { useMemo, useRef } from "react";
import { useUser } from "@/app/context/UserContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePjesData } from "../hooks/usePjesData";
import styles from "@/app/(privada)/privateLayout.module.css";
import Image from "next/image";
import {
  FaAngleDoubleUp,
  FaCheckSquare,
  FaClock,
  FaComment,
  FaCheck,
  FaDatabase,
  FaDownload,
  FaEdit,
  FaFilePdf,
  FaForward,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaRegSquare,
  FaStar,
  FaTrash,
  FaUserSlash,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  ChartOptions,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { toast } from "react-toastify";
import DistribuicaoModal from "@/components/DistribuicaoModal";
import EventoModal from "@/components/EventoModal";
import OperacaoModal from "@/components/OperacaoModal";
import EscalaModal from "@/components/EscalaModal";
import PrestacaoContasModal from "@/components/ModalPrestacaoContas";

const mapaMesesTexto: { [key: number]: string } = {
  1: "JAN",
  2: "FEV",
  3: "MAR",
  4: "ABR",
  5: "MAI",
  6: "JUN",
  7: "JUL",
  8: "AGO",
  9: "SET",
  10: "OUT",
  11: "NOV",
  12: "DEZ",
};

export default function UserMasterPage() {
  const searchParams = useSearchParams();
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);

  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const [pjesdist, setPjesdist] = useState<any[]>([]);
  
  const [abaAtiva, setAbaAtiva] = useState<"diretorias" | "convenios">("diretorias");

  const [eventoExpandido, setEventoExpandido] = useState<number | null>(null);
  const [buscaEventos, setBuscaEventos] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalDataEvento, setModalDataEvento] = useState<any | null>(null);
  
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [eventoSelecionadoObj, setEventoSelecionadoObj] = useState<any | null>(null);

  const [operacoesEvento, setOperacoesEvento] = useState<any[]>([]);
  const [selectedOperacaoId, setSelectedOperacaoId] = useState<number | null>(null);
  const [escalasOperacao, setEscalasOperacao] = useState<{ [key: number]: any[] }>({});
  const [mostrarModalOperacao, setMostrarModalOperacao] = useState(false);
  const [modalDataOperacao, setModalDataOperacao] = useState<any | null>(null);

  const [mostrarModalEscala, setMostrarModalEscala] = useState(false);
  const [modalDataEscala, setModalDataEscala] = useState<any | null>(null);
  const [modalData, setModalData] = useState<any | null>(null);
  const [mostrarModalPrestacaoContas, setMostrarModalPrestacaoContas] = useState(false);
  const [isBaixandoExcel, setIsBaixandoExcel] = useState(false);

  const [cotasTotais, setCotasTotais] = useState<Record<number, number>>({});
  const [impedidosPorEvento, setImpedidosPorEvento] = useState<Record<number, number>>({});
  const [totalImpedidos, setTotalImpedidos] = useState<number>(0);
  const [buscaEscala, setBuscaEscala] = useState("");


    const user = useUser();
    const userId = user?.id;

    const {
      tetos,
      loadingTetos,
      tetoSelecionado,
      setTetoSelecionado,
      distribuicoes,
      setDistribuicoes,
      eventosDistribuicao,
      setEventosDistribuicao,
      fetchEventosPorDistribuicao,
      loadingDetalhes,
    } = usePjesData(ano, mes);

    //Função para fecha o menu toogle apos clicar fora nos eventos
    useEffect(() => {
      const handleClickForaDoMenu = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setMenuAbertoId(null);
        }
      };
    
      document.addEventListener("mousedown", handleClickForaDoMenu);
      return () => {
        document.removeEventListener("mousedown", handleClickForaDoMenu);
      };
    }, []);
    //Função para fecha o menu toogle apos clicar fora nos eventos
  
  
    const distribuicoesDoTeto = useMemo(() => {
      if (!tetoSelecionado) return [];
      return distribuicoes.filter(
        (dist) => dist.codVerba === tetoSelecionado.codVerba
      );
    }, [distribuicoes, tetoSelecionado]);

    const distSelecionada = distribuicoesDoTeto.find((d) => d.id === selectedDistId);
    // função para trazer o resumo por diretoria
    const resumoPorVerba = useMemo(() => {
      const resumo: Record<string, {
        nomeVerba: string;
        omes: Record<string, {
          nomeOme: string;
          codVerba: string;
          ttCtOfEvento: number;
          ttCtPrcEvento: number;
          somaCotaOfEscala: number;
          somaCotaPrcEscala: number;
          valorTtPlanejado: number;
          valorTtExecutado: number;
          saldoFinal: number;
        }>
      }> = {};
    
      distribuicoes.forEach(dist => {
        const nomeVerba = dist?.nomeVerba || "SEM VERBA";
    
        (dist.eventos || []).forEach(evento => {
          const nomeOme = evento?.nomeOme || "SEM OME";
          const codVerba = evento?.codVerba || "N/A";
          const keyVerba = nomeVerba;
          const keyOme = `${nomeOme}-${codVerba}`;
    
          if (!resumo[keyVerba]) {
            resumo[keyVerba] = {
              nomeVerba,
              omes: {},
            };
          }
    
          if (!resumo[keyVerba].omes[keyOme]) {
            resumo[keyVerba].omes[keyOme] = {
              nomeOme,
              codVerba,
              ttCtOfEvento: 0,
              ttCtPrcEvento: 0,
              somaCotaOfEscala: 0,
              somaCotaPrcEscala: 0,
              valorTtPlanejado: 0,
              valorTtExecutado: 0,
              saldoFinal: 0,
            };
          }
    
          const omeData = resumo[keyVerba].omes[keyOme];
          omeData.ttCtOfEvento += evento.ttCtOfEvento || 0;
          omeData.ttCtPrcEvento += evento.ttCtPrcEvento || 0;
          omeData.somaCotaOfEscala += evento.somaCotaOfEscala || 0;
          omeData.somaCotaPrcEscala += evento.somaCotaPrcEscala || 0;
          omeData.valorTtPlanejado += evento.valorTtPlanejado || 0;
          omeData.valorTtExecutado += evento.valorTtExecutado || 0;
          omeData.saldoFinal += evento.saldoFinal || 0;
        });
      });
    
      return resumo;
    }, [distribuicoes]);
    // função para trazer o resumo por diretoria
    
    useEffect(() => {
      const anoParam = searchParams.get("ano");
      const mesParam = searchParams.get("mes");

      if (anoParam && mesParam) {
        const mapaMeses: { [key: string]: number } = {
          JAN: 1,
          FEV: 2,
          MAR: 3,
          ABR: 4,
          MAI: 5,
          JUN: 6,
          JUL: 7,
          AGO: 8,
          SET: 9,
          OUT: 10,
          NOV: 11,
          DEZ: 12,
        };

        setAno(Number(anoParam));
        setMes(mapaMeses[mesParam.toUpperCase()]);
      }
    }, [searchParams]);

    //inicio Trazer a soma de ttCota para mostrar na tabela 
    useEffect(() => {
      const carregarCotasTotais = async () => {
        if (!ano || !mes) return;
    
        const matriculasUnicas = new Set<number>();
    
        Object.values(escalasOperacao).forEach((listaEscalas) => {
          listaEscalas.forEach((escala) => {
            if (escala.matSgp) {
              matriculasUnicas.add(escala.matSgp);
            }
          });
        });
    
        const resultados: Record<number, number> = {};
    
        await Promise.all(
          Array.from(matriculasUnicas).map(async (matSgp) => {
            try {
              const res = await fetch(
                `/api/cotas/soma?matSgp=${matSgp}&ano=${ano}&mes=${mes}`
              );
              const data = await res.json();
              resultados[matSgp] = data.quantidade ?? 0;
            } catch (err) {
              console.error("Erro ao buscar cotas:", err);
              resultados[matSgp] = 0;
            }
          })
        );
    
        setCotasTotais(resultados);
      };
    
      carregarCotasTotais();
    }, [escalasOperacao, ano, mes]);
    //fim Trazer a soma de ttCota para mostrar na tabela 

    const fetchDadosDoEvento = async (eventoId: number) => {
      try {
        const res = await fetch(`/api/pjesevento/${eventoId}`);
        if (!res.ok) throw new Error("Erro ao buscar evento");
    
        const data = await res.json();
        setOperacoesEvento(data.pjesoperacoes || []);
        setEventoSelecionadoObj(data); // atualiza com os novos dados
    
      } catch (err) {
        console.error("Erro ao buscar evento:", err);
      }
    };

    const handleExpandirEvento = async (eventoId: number) => {
      if (eventoExpandido === eventoId) {
        await fetchDadosDoEvento(eventoId);
        setEventoExpandido(null);
        setOperacoesEvento([]);
        return;
      }

      try {
        const res = await fetch(`/api/pjesevento/${eventoId}`);
        if (!res.ok) throw new Error("Erro ao buscar operações");

        const data = await res.json();
        setOperacoesEvento(data.pjesoperacoes || []);
        setEventoExpandido(eventoId);
        setSelectedEventoId(eventoId);
        setEventoSelecionadoObj(data);
      } catch (err) {
        console.error("Erro ao buscar operações:", err);
      }
    };

    const fetchEscalasDaOperacao = async (operacaoId: number) => {
      if (selectedOperacaoId === operacaoId) {
        setSelectedOperacaoId(null);
        return;
      }

      try {
        const params = new URLSearchParams({
          operacaoId: String(operacaoId),
          ano: String(ano),
          mes: String(mes),
        });

        const res = await fetch(`/api/pjesescala?${params.toString()}`);
        if (!res.ok) throw new Error("Erro ao buscar escalas");

        const data = await res.json();
        setEscalasOperacao((prev) => ({ ...prev, [operacaoId]: data }));
        setSelectedOperacaoId(operacaoId);
      } catch (err) {
        console.error("Erro ao buscar escalas:", err);
      }
    };

    const getImagemUrlByCodVerba = (codVerba: string) => {
      const teto = tetos.find((t) => t.codVerba === codVerba);
      return teto?.imagemUrl || "/assets/images/default_logo.png";
    };

    const getNomeDiretoriaOrigemByEvento = (evento: any) => {
      const dist = distribuicoes.find((d) => d.id === evento.pjesDistId);
      return dist?.nomeDiretoria || "DIRETORIA";
    };
    
    const onDistribuicaoClick = (distId: number) => {
      if (!tetoSelecionado?.codVerba) {
        toast.warning("Selecione um teto primeiro.");
        return;
      }
      setSelectedDistId(distId);
      fetchEventosPorDistribuicao(distId, tetoSelecionado.codVerba);
    };

    const toggleMenu = (id: number) => {
      setMenuAbertoId((prev) => (prev === id ? null : id));
    };

    const menuItemStyle = {
      padding: "8px",
      cursor: "pointer",
      color: "#fff",
      fontSize: "13px",
      borderBottom: "1px solid #444",
    };

    const handleToggleStatus = async (evento: any) => {
      const novoStatus =
        evento.statusEvento === "AUTORIZADA" ? "HOMOLOGADA" : "AUTORIZADA";
    
      const acao =
        novoStatus === "HOMOLOGADA" ? "Homologar" : "Autorizar";
    
      const confirmado = window.confirm(`Deseja realmente ${acao} este evento?`);
    
      if (!confirmado) return;
    
      try {
        const res = await fetch(`/api/pjesevento/${evento.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statusEvento: novoStatus }),
        });
    
        if (!res.ok) {
          const data = await res.json();
          alert(`Erro ao alterar status: ${data.error}`);
          return;
        }
    
        // Atualiza o status localmente no array de eventos
        setEventosDistribuicao((prevEventos) =>
          prevEventos.map((e) =>
            e.id === evento.id ? { ...e, statusEvento: novoStatus } : e
          )
        );
    
        // Mostra toast de sucesso
        toast.success(`Evento ${acao} com sucesso.`);
    
        // Fecha o menu
        setMenuAbertoId(null);
      } catch (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro interno ao alterar status");
      }
    };
    
    const handleEditarEvento = (evento: any) => {
      setModalDataEvento(evento);
      setMostrarModalEvento(true);
    };

    const handleExcluirEvento = async (eventoId: number) => {
      if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    
      const toastId = toast.loading("Excluindo evento...");
    
      try {
        const res = await fetch(`/api/pjesevento/${eventoId}`, {
          method: "DELETE",
        });
    
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Erro ao excluir evento.");
        }
    
        // ✅ Atualiza a lista após exclusão
        if (selectedDistId && tetoSelecionado?.codVerba) {
          await fetchEventosPorDistribuicao(selectedDistId, tetoSelecionado.codVerba, true);
        }
    
        toast.update(toastId, {
          render: "Evento excluído com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
    
        if (eventoExpandido === eventoId) {
          setEventoExpandido(null);
          setOperacoesEvento([]);
        }
    
      } catch (err) {
        console.error("Erro ao excluir evento:", err);
        toast.update(toastId, {
          render: "Erro ao excluir evento.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

    async function homologarEventos(mes: number, ano: number) {
      const confirmar = window.confirm("Deseja Homologar todos Eventos?");
      if (!confirmar) return;
  
      try {
        const res = await fetch(
          `/api/pjesevento/homologar?mes=${mes}&ano=${ano}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
  
        if (!res.ok) {
          const data = await res.json();
          alert( "Usuario sem permissão. Apenas Usuario Tecnico ou Auxiliar: " + (data.error || res.statusText));
          return;
        }

        alert("Eventos homologados com sucesso!");
      } catch (error) {
        alert("Erro interno ao homologar eventos.");
        console.error(error);
      }
    }
    
    const handleExcluirOperacao = async (operacaoId: number) => {
      const confirmar = confirm("Tem certeza que deseja excluir esta operação?");
      if (!confirmar) return;
    
      const toastId = toast.loading("Excluindo operação...");
    
      try {
        const res = await fetch(`/api/pjesoperacao/${operacaoId}`, {
          method: "DELETE",
        });
    
        const resultado = await res.json();
    
        if (!res.ok) {
          throw new Error(resultado?.error || "Erro ao excluir operação.");
        }
    
        // ✅ Atualiza a lista de operações removendo a excluída
        setOperacoesEvento((prev) => prev.filter((op) => op.id !== operacaoId));
    
        toast.update(toastId, {
          render: "Operação excluída com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Erro ao excluir operação:", error);
        toast.update(toastId, {
          render: "Erro ao excluir operação.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

    async function salvarOuAtualizarEscala(dados: any): Promise<boolean> {
      const isEdit = Boolean(dados.id);
    
      const params = new URLSearchParams({
        ano: String(ano),
        mes: String(mes),
      });
    
      const url = isEdit
        ? `/api/pjesescala/${dados.id}?${params.toString()}`
        : `/api/pjesescala?${params.toString()}`;
    
      const method = isEdit ? "PUT" : "POST";
    
      const toastId = toast.loading(
        isEdit ? "Atualizando escala..." : "Adicionando escala..."
      );
    
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
    
        const text = await res.text();
        let result: any;
    
        try {
          result = JSON.parse(text);
        } catch {
          console.error("Resposta inválida:", text);
          toast.update(toastId, {
            render: "Erro inesperado ao salvar escala.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          return false;
        }
    
        if (!res.ok) {
          toast.update(toastId, {
            render: result?.error || "Erro ao salvar escala.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          return false;
        }

        // ✅ Atualiza corretamente a lista
        setEscalasOperacao((prev) => {
          const operacaoId = dados.pjesOperacaoId;
          const escalas = prev[operacaoId] || [];
        
          const novasEscalas = isEdit
            ? escalas.map((e: any) => (e.id === result.id ? result : e))
            : [...escalas, result];
        
          // ✅ Atualizar os totais da operação
          const totalPraças = novasEscalas.filter((e) => e.tipoSgp === "P").length;
          const totalOficiais = novasEscalas.filter((e) => e.tipoSgp === "O").length;
        
          // Atualiza a operação
          setOperacoesEvento((prevOps) =>
            prevOps.map((op) =>
              op.id === operacaoId
                ? {
                    ...op,
                    ttCtPrcExeOper: totalPraças,
                    ttCtOfExeOper: totalOficiais,
                  }
                : op
            )
          );
        
          return {
            ...prev,
            [operacaoId]: novasEscalas,
          };
        });
        
    
        toast.update(toastId, {
          render: isEdit
            ? "Escala atualizada com sucesso!"
            : "Escala adicionada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        // Refaz o fetch do evento para atualizar os dados de cotas
        if (eventoSelecionadoObj?.id) {
          await fetchDadosDoEvento(eventoSelecionadoObj.id);
        }
    
        return true;
      } catch (error) {
        console.error("Erro ao salvar Escala:", error);
        toast.update(toastId, {
          render: "Erro interno ao salvar escala.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return false;
      }
    }
    
    const handleExcluirEscala = async (escalaId: number) => {
      if (!confirm("Tem certeza que deseja excluir esta escala?")) return;
      const toastId = toast.loading("Excluindo escala...");
      try {
        const res = await fetch(`/api/pjesescala/${escalaId}`, {
          method: "DELETE",
        });

        const result = await res.json();
    
        if (!res.ok) {
          throw new Error(result?.error || "Erro ao excluir escala.");
        }
    
        setEscalasOperacao((prev) => {
          const novaLista = { ...prev };
          if (selectedOperacaoId && novaLista[selectedOperacaoId]) {
            const novasEscalas = novaLista[selectedOperacaoId].filter(
              (e: any) => e.id !== escalaId
            );
        
            // ✅ Atualiza operação com novos totais
            const totalPraças = novasEscalas.filter((e) => e.tipoSgp === "P").length;
            const totalOficiais = novasEscalas.filter((e) => e.tipoSgp === "O").length;
        
            setOperacoesEvento((prevOps) =>
              prevOps.map((op) =>
                op.id === selectedOperacaoId
                  ? {
                      ...op,
                      ttCtPrcExeOper: totalPraças,
                      ttCtOfExeOper: totalOficiais,
                    }
                  : op
              )
            );
        
            novaLista[selectedOperacaoId] = novasEscalas;
          }
          return novaLista;
        });

          // Refaz o fetch do evento para atualizar os dados de cotas
          if (eventoSelecionadoObj?.id) {
          await fetchDadosDoEvento(eventoSelecionadoObj.id);
      }
        
    
        toast.update(toastId, {
          render: "Escala excluída com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Erro ao excluir escala:", error);
        toast.update(toastId, {
          render: "Erro ao excluir escala.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

    const handleEditarEscala = (escala: any) => {
      setModalDataEscala(escala); // preenche os dados no modal
      setMostrarModalEscala(true); // abre o modal
    };

    // Função para remover acentos e caracteres especiais e trocar espaços por _
    function removerCaracteresEspeciais(str: string): string {
      return str
        .replace(/[^ -~]+/g, "") // remove todos os caracteres não ASCII visíveis (como º, ª, Â)
        .normalize("NFD") // normaliza acentos
        .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
        .replace(/[^a-zA-Z0-9\s]/g, "") // remove outros símbolos especiais
        .replace(/\s+/g, "_"); // substitui espaços por _
    }

    //Codigo para ocultar botoes quando oevento estiver HOMOLOGADO
    const isRestrito = eventoSelecionadoObj?.statusEvento === "HOMOLOGADA" && user?.typeUser !== 5 && user?.typeUser !== 10;

    //Buscar impedidos por evento e a soma total
      useEffect(() => {
        const fetchImpedidosPorEvento = async () => {
          if (!ano || !mes) return;
      
          try {
            const res = await fetch(`/api/pjesevento/impedidos?ano=${ano}&mes=${mes}`);
            const data = await res.json();
      
            const mapa: Record<number, number> = {};
            let total = 0;
      
            data.forEach((item: any) => {
              const eventoId = item.eventoId;
              const totalEvento = item.totalImpedidos ?? 0;
              mapa[eventoId] = totalEvento;
              total += totalEvento;
            });
      
            setImpedidosPorEvento(mapa);
            setTotalImpedidos(total);
          } catch (error) {
            console.error("Erro ao buscar impedidos por evento:", error);
          }
        };
      
        fetchImpedidosPorEvento();
      }, [ano, mes]);
    //Buscar impedidos por evento e a soma total

    //Toast para baixar a planilha de prestação de contas
    useEffect(() => {
      if (isBaixandoExcel) {
        toast.info("Gerando Prestação de Contas. Aguarde! Isso pode levar alguns segundos...", {
          toastId: "baixando-excel",
          autoClose: false,
        });
      } else {
        toast.dismiss("baixando-excel");
      }
    }, [isBaixandoExcel]);
    //Toast para baixar a planilha de prestação de contas
    
    
    // INICIO CONFIG DO GRÁFICO
    const chartData = {
      labels: distribuicoesDoTeto.map((dist) => dist.nomeDiretoria),
      datasets: [
        {
          label: "Oficiais Planejado",
          data: distribuicoesDoTeto.map((dist) => dist.ttCtOfDist),
          backgroundColor: "#5e96ff",
        },
        {
          label: "Oficiais Executado",
          data: distribuicoesDoTeto.map((dist) => dist.ttCotaOfEscala),
          backgroundColor: "#214fa5",
        },
        {
          label: "Praças Planejado",
          data: distribuicoesDoTeto.map((dist) => dist.ttCtPrcDist),
          backgroundColor: "#4ef064",
        },
        {
          label: "Praças Executado",
          data: distribuicoesDoTeto.map((dist) => dist.ttCotaPrcEscala),
          backgroundColor: "#168325",
        },
      ],
    };
    
    const chartOptions: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 10,
          bottom: 0,
        },
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
            padding: 10,
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
          } as any,
        },
      },
    };
    // FIM CONFIG DO GRÁFICO



    function calcularSomas(tetoCodVerba: number, tetoOf: number, tetoPrc: number) {
      const distribsDoTeto = distribuicoes.filter(d => Number(d.codVerba) === tetoCodVerba);
      const ttSomaCtOfDist = distribsDoTeto.reduce((acc, curr) => acc + (curr.ttCtOfDist ?? 0), 0);
      const ttSomaCtPrcDist = distribsDoTeto.reduce((acc, curr) => acc + (curr.ttCtPrcDist ?? 0), 0);
      const somaCotaOfEscala = distribsDoTeto.reduce((acc, curr) => acc + (curr.ttCotaOfEscala ?? 0), 0);
      const somaCotaPrcEscala = distribsDoTeto.reduce((acc, curr) => acc + (curr.ttCotaPrcEscala ?? 0), 0);
      const ttSomaCotaOfSaldo = tetoOf - somaCotaOfEscala;
      const ttSomaCotaPrcSaldo = tetoPrc - somaCotaPrcEscala;
      return {ttSomaCtOfDist, ttSomaCtPrcDist, ttSomaCotaOfSaldo, ttSomaCotaPrcSaldo };
    }
    
    
  return (
    <div>
      {loadingTetos ? <p>Carregando dados...</p> : (
        <div className={styles.divReturn}>
          <h3 className={styles.divTetoSecundaria}>PJES {mapaMesesTexto[mes!]} | {ano}</h3>
            <div>
              {/* TETO PRINCIPAL */}
              <div className={styles.divTetoPrincipal}>
              <ul className={styles.ulTeto}>
              {tetos.map((teto) => {
                  const isSelected = tetoSelecionado?.codVerba === teto.codVerba;
                  const { ttSomaCtOfDist, ttSomaCtPrcDist, ttSomaCotaOfSaldo, ttSomaCotaPrcSaldo } =
                    calcularSomas(Number(teto.codVerba), teto.tetoOf, teto.tetoPrc);


                  return (
                    <li
                      key={teto.codVerba}
                      onClick={() => {
                        setEventoExpandido(null);
                        setOperacoesEvento([]);
                        setSelectedOperacaoId(null);
                        setEventosDistribuicao([]);
                        setTetoSelecionado(teto);
                      }}
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

                      {teto.nomeVerba}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <span className={styles.spanDistribuicaoCotas}>
                              <FaStar /> {teto.tetoOf} | {teto.tetoOf - ttSomaCtOfDist}
                            </span>
                            <span className={styles.spanDistribuicaoCotas}>
                              <FaDatabase /> {ttSomaCotaOfSaldo} 
                            </span>
                          </div>
                          <div>
                            <span className={styles.spanDistribuicaoCotas}>
                              <FaAngleDoubleUp /> {teto.tetoPrc} | {teto.tetoPrc - ttSomaCtPrcDist}
                            </span>
                            <span
                              className={styles.spanDistribuicaoCotas}
                              style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
                            >
                              <FaDatabase style={{ marginRight: '4px' }} />
                              {ttSomaCotaPrcSaldo}
                            </span>
                          </div>
                        </div>

                    </li>
                  );
                })}

              </ul>

              </div>
              {/* TETO PRINCIPAL */}

              {/* DIV DISTRIBUIÇÃO */}
              <div className={styles.divDistPrincipal}>
                {/* TABELA DISTRIBUIÇÃO */}
                  <div style={{ width: "40%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 className={styles.divDistTitulo}>
                          <strong>DISTRIBUIÇÃO</strong>
                        </h3>
                        <div className={styles.divBtnCadastrarDist} 
                            onClick={() => {
                            setModalData(null);
                            setMostrarModal(true);
                          }}
                        >
                          <FaPlus color="#000000" />
                        </div>
                      </div>
                      <div className={styles.tabelaWrapper}>
                        <table className={styles.tableDist}>
                          <thead>
                            <tr className={styles.theadPrincipal}>
                              <th className={styles.thPadrao}>DIRETORIA</th>
                              <th className={styles.thPadrao}>DECRETO</th>
                              <th className={styles.thPadrao}>OFICIAIS</th>
                              <th className={styles.thPadrao}>PRAÇAS</th>
                              <th className={styles.thPadrao}>#</th>
                            </tr>
                          </thead>
                          <tbody>
                            {distribuicoesDoTeto.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                                  Nenhuma distribuição encontrada.
                                </td>
                              </tr>
                            ) : (
                              distribuicoesDoTeto.map((dist) => (
                                <tr style={{cursor:"pointer", fontSize:"15px"}}
                                    key={dist.id}
                                    onClick={() => {setSelectedDistId(dist.id);
                                      fetchEventosPorDistribuicao(dist.id, tetoSelecionado?.codVerba!);}}
                                      className={`${ selectedDistId === dist.id ? styles["linha-selecionada"]: ""}`}
                                  >
                                  <td className={styles.tdPadrao}>{dist.nomeDiretoria}</td>
                                  <td className={styles.tdPadrao}>{dist.nomeDist}</td>
                                  <td className={styles.tdPadrao}>{dist.ttCtOfDist} | {dist.ttCotaOfEscala}</td>
                                  <td className={styles.tdPadrao}>{dist.ttCtPrcDist} | {dist.ttCotaPrcEscala}</td>
                                  <td className={styles.tdPadrao}>
                                    <div className={styles.acoesContainer}>
                                      <div className={styles.acaoItem}>
                                      <FaEdit
                                        className={styles.iconeAcaoEdicao}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setModalData(dist);
                                          setMostrarModal(true);
                                        }}
                                      />
                                      </div>
                                        <div className={styles.acaoItem}>
                                        <FaTrash
                                            className={styles.iconeAcaoLixeira}
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (confirm("Deseja realmente excluir esta distribuição?")) {
                                                const loadingId = toast.loading("Excluindo distribuição...");

                                                try {
                                                  const res = await fetch(`/api/pjesdist/${dist.id}`, {
                                                    method: "DELETE",
                                                  });

                                                  if (!res.ok) throw new Error("Erro na exclusão");

                                                  setDistribuicoes((prev) =>
                                                    prev.filter((d) => d.id !== dist.id)
                                                  );

                                                  toast.update(loadingId, {
                                                    render: "Distribuição excluída com sucesso!",
                                                    type: "success",
                                                    isLoading: false,
                                                    autoClose: 3000,
                                                  });
                                                } catch (error) {
                                                  console.error("Erro ao excluir:", error);

                                                  toast.update(loadingId, {
                                                    render: "Erro ao excluir distribuição.",
                                                    type: "error",
                                                    isLoading: false,
                                                    autoClose: 3000,
                                                  });
                                                }
                                              }
                                            }}
                                          />
                                        </div>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                  </div>
                {/* TABELA DISTRIBUIÇÃO */}


                {/* INICIO DIV INSIDES */}
                <div className={styles.containerInsides}>
                  <h3>
                    <strong>BANCO DE COTAS</strong>
                  </h3>

                  <div className={styles.boxResumo}>
                    {/* BLOCO 1 */}
                    <div
                      className={`${styles.blocoResumo} ${styles.blocoComSeparador}`}
                    >
                      <FaStar size={28} color="#008cff" />
                      <div className={styles.valorResumo}>
                      {distSelecionada?.ttOfDistMenosEvento ?? 0}

                      </div>
                      <div>Oficiais</div>
                    </div>

                    {/* BLOCO 2 */}
                    <div className={styles.blocoResumo}>
                      <FaAngleDoubleUp size={28} color="#6ab90f" />
                      <div className={styles.valorResumo}>
                      {distSelecionada?.ttPrcDistMenosEvento ?? 0}
                      </div>
                      <div>Praças</div>
                    </div>
                  </div>
                </div>
                {/* FIM DIV INSIDES */}


                {/* INICIO DIV INSIDES */}
                  <div className={styles.containerInsides}>
                    <h3>
                      <strong>INSIDES</strong>
                    </h3>

                    <div className={styles.boxResumo}>
                      {/* BLOCO 1 */}
                      <div
                        className={`${styles.blocoResumo} ${styles.blocoComSeparador}`}
                      >
                        <FaUserSlash size={28} color="orange" />
                        <div className={styles.valorResumo}>
                        {totalImpedidos ?? 0}
                        </div>
                        <div>Pms Impedidos</div>
                      </div>

                      {/* BLOCO 2 */}
                      <div className={styles.blocoResumo}>
                        <FaLockOpen size={28} color="red" />
                        <div className={styles.valorResumo}>
                        {distSelecionada?.ttEventosAutorizados ?? 0}
                        </div>
                        <div>Homolog Pendente</div>
                      </div>
                    </div>
                  </div>
                {/* FIM DIV INSIDES */}


                {/* INICIO DIV GRAFICO */}
                <div className={styles.containerGrafico}>
                  <h3>
                    <strong>GRÁFICO</strong>
                  </h3>
                  <div className={styles.boxGrafico}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
                {/* FIM DIV GRAFICO */}

              </div>
              {/* DIV DISTRIBUIÇÃO */}
            </div>

            <div style={{ display: "flex", flex: 1, border: "1px solid #cac3c3" }}>

                  {/* INICIO RESUMO POR DIRETORIA */}
                  <div className={styles.eventoPrincipal}>
                    {Object.values(resumoPorVerba).map((verbaResumo) => (
                      <div key={verbaResumo.nomeVerba} className={styles.larguraDiretoria}>
                        <div className={styles.abasContainer}>
                          <button className={ abaAtiva === "diretorias" ? styles.abaAtiva : styles.aba} onClick={() => setAbaAtiva("diretorias")}>
                            {verbaResumo.nomeVerba}
                          </button>
                        </div>
                        

                        <table className={styles["tabela-zebra-ome"]}>
                          <thead>
                            <tr>
                              <th>Unidade</th>
                              <th>Cod Verba</th>
                              <th>Oficiais</th>
                              <th>Praças</th>
                              <th>#</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(verbaResumo.omes).map((omeResumo) => (
                              <tr key={`${omeResumo.nomeOme}-${omeResumo.codVerba}`}>
                                <td>{omeResumo.nomeOme}</td>
                                <td>{omeResumo.codVerba}</td>
                                <td>{omeResumo.ttCtOfEvento} | {omeResumo.somaCotaOfEscala}</td>
                                <td>{omeResumo.ttCtPrcEvento} | {omeResumo.somaCotaPrcEscala}</td>
                                <td><FaCheck /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className={styles.resumoPrincipalOme}>
                          <h3 className={styles.h3ResumoOme}><strong>Planejado:</strong></h3>
                          <span className={styles.spanResumoOme}>
                            R$ {
                              Object.values(verbaResumo.omes).reduce(
                                (soma, ome) => soma + ome.valorTtPlanejado,
                                0
                              ).toFixed(2)
                            }
                          </span>
                        </div>
                        <hr className={styles.hrResumoOme} />

                        <div className={styles.resumoPrincipalOme}>
                          <h3 className={styles.h3ResumoOme}><strong>Executado:</strong></h3>
                          <span className={styles.spanResumoOme}>
                            R$ {
                              Object.values(verbaResumo.omes).reduce(
                                (soma, ome) => soma + ome.valorTtExecutado,
                                0
                              ).toFixed(2)
                            }
                          </span>
                        </div>
                        <hr className={styles.hrResumoOme} />

                        <div className={styles.resumoSaldoOme}>
                          <h3 className={styles.h3ResumoOme}><strong>Saldo:</strong></h3>
                          <span className={styles.spanResumoOme}>
                            R$ {
                              Object.values(verbaResumo.omes).reduce(
                                (soma, ome) => soma + ome.saldoFinal,
                                0
                              ).toFixed(2)
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* FIM RESUMO POR DIRETORIA */}

                  {/* INICIO EVENTOS */}
                    <div className={styles.eventoPrincipal}>
                      <div className={styles.eventoTitulo}>
                        <h3>EVENTOS</h3>
                      </div>
                      <div className={styles.eventoNomePrincipal}>
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={buscaEventos}
                            onChange={(e) => setBuscaEventos(e.target.value)}
                            className={styles.eventoInputBuscar}
                          />

                          {/* inicio botao add eventos*/}
                            <div
                              className={styles.eventoCadastrar}
                              onClick={() => {
                                if (!selectedDistId) {
                                  alert("Selecione uma distribuição primeiro.");
                                  return;
                                }

                                setModalDataEvento({
                                  pjesDistId: selectedDistId,
                                  mes: Number(mes),
                                  ano: Number(ano),
                                  userId: userId,
                                  statusEvento: "AUTORIZADA",
                                });
                                setMostrarModalEvento(true);
                              }}
                            >
                              <FaPlus color="#ff8800" />
                            </div>
                         {/* fim botao add eventos*/}



                        {/* inicio botao homologar todos eventos*/}
                        <div
                          className={styles.operacaoCadastrar}
                          onClick={() => homologarEventos(Number(mes), Number(ano))}
                          title="Homologar todos eventos"
                          style={{ cursor: "pointer" }}
                        >
                          <FaLock color="#f40606" />
                        </div>
                      {/* fim botao homologar todos eventos*/}


                        {/* inicio botao baixar planilha*/}
                        <div
                            className={styles.operacaoCadastrar}
                            onClick={() => setMostrarModalPrestacaoContas(true)}
                            title="Prestar Contas"
                          >
                          <FaDownload color="#1f9c00" />
                      </div>
                        {/* fim botao baixar planilha*/}
                      </div>

                      {Array.isArray(eventosDistribuicao) && eventosDistribuicao.length > 0 && (
                        <div>
                          {Object.entries(
                              eventosDistribuicao
                                .filter((evento: any) => {
                                  const busca = buscaEventos.toLowerCase();
                                  return (
                                    evento.nomeEvento?.toLowerCase().includes(busca) ||
                                    evento.ome?.nomeOme?.toLowerCase().includes(busca) ||
                                    getNomeDiretoriaOrigemByEvento(evento)?.toLowerCase().includes(busca)
                                  );
                                })
                                .reduce((acc: any, evento: any) => {
                                  const omeId = evento.ome?.id;
                                  if (!acc[omeId]) {
                                    acc[omeId] = {
                                      nomeOme: evento.ome?.nomeOme || "OME Desconhecida",
                                      eventos: [],
                                    };
                                  }
                                  acc[omeId].eventos.push(evento);
                                  return acc;
                                }, {})
                            ).map(([omeId, { nomeOme, eventos }]: any) => (

                            <div key={omeId}>
                             {eventos.map((evento: any) => {
                              const imagemUrl = getImagemUrlByCodVerba(evento.codVerba);
                              const isEventoSelecionado = evento.id === eventoSelecionadoObj?.id;
                                return (
                                  <div key={evento.id}>
                                    <ul className={styles.eventoUl} onClick={() => handleExpandirEvento(evento.id)}>
                                        <li
                                          className={styles.eventoImagemLi}
                                          style={{
                                            fontWeight: eventoExpandido === evento.id ? "bold" : "normal",
                                            backgroundColor: eventoExpandido === evento.id ? "#ffdcba" : "#ffffff",
                                          }}
                                        >
                                          {/* Botão de menu (três pontinhos) */}
                                          <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(evento.id);
                                              }}
                                              className={styles.eventoMenuEditarExcluir}
                                            >
                                            ⋮
                                          </div>

                                          {/* Submenu */}
                                            {menuAbertoId === evento.id && (
                                            <div
                                              ref={menuRef}
                                              className={styles.eventoSubMenuEditarExcluir}
                                            >
                                              <div
                                                style={menuItemStyle} onClick={() => handleToggleStatus(evento)}>
                                                {evento.statusEvento === "AUTORIZADA" ? "Homologar" : "Autorizar"}
                                              </div>

                                              <div style={menuItemStyle} onClick={() => handleEditarEvento(evento)}>Editar</div>
                                              <div style={{...menuItemStyle, borderBottom: "none",}}
                                                onClick={() => handleExcluirEvento(evento.id)}
                                              >
                                                Excluir
                                              </div>
                                            </div>
                                          )}

                                        {/* Imagem do teto */}
                                        <div className={styles.eventoImagem}>
                                          <Image
                                            src={imagemUrl}
                                            alt="logo"
                                            width={40}
                                            height={40}
                                            style={{ borderRadius: "50%" }}
                                          />
                                          <span style={{ fontSize: "8px" }}>
                                            {getNomeDiretoriaOrigemByEvento(evento)}
                                          </span>
                                        </div>

                                        {/* Texto à direita */}
                                        <div style={{ flex: 1}}>
                                          <div className={styles.eventoTextoADireita}>
                                            {evento.ome?.nomeOme} <br />
                                            {evento.nomeEvento}
                                          </div>
                                          <div className={styles.conteudoEvento}>
                                          <span style={{ paddingRight: "20px" }}>
                                              Oficiais: {evento.ttCtOfEvento} | {isEventoSelecionado ? eventoSelecionadoObj?.somaCotaOfEscala ?? "-" : "-"}
                                            </span>
                                            <span style={{ paddingRight: "20px" }}>
                                              Praças: {evento.ttCtPrcEvento} | {isEventoSelecionado ? eventoSelecionadoObj?.somaCotaPrcEscala ?? "-" : "-"}
                                            </span>
                                            <FaUserSlash color="orange" style={{ marginRight: "5px" }} />
                                            {impedidosPorEvento[evento.id] ?? 0}
                                          </div>
                                        </div>

                                        <div style={{ fontSize: "20px", paddingTop: "5px" }}>
                                          <div style={{ fontSize: "20px", paddingBottom: "5px", marginRight: "33px",}}>
                                            {evento.statusEvento === "AUTORIZADA" ? (
                                              <FaLockOpen color="green" />
                                            ) : evento.statusEvento === "HOMOLOGADA" ? (
                                              <FaLock color="red" />
                                            ) : null}
                                          </div>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                );
                              })}

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  {/* FIM EVENTOS */}

                  {/* INICIO OPERAÇÕES */}
                    <div className={styles.operacaoPrincipal}>
                      <div className={styles.operacaoTitulo}>
                        <h3>OPERAÇÕES</h3>
                      </div>

                      <div className={styles.operacaoNomePrincipal}>
                      <input
                          type="text"
                          placeholder="Buscar..."
                          className={styles.operacaoInputBuscar}
                          value={buscaEscala}
                          onChange={(e) => setBuscaEscala(e.target.value)}
                        />
                        {/* INICIO BOTAO DE ADIOCNAR OPERAÇÃO*/}
                        <div className={styles.operacaoCadastrar}
                            onClick={() => {
                              if (!selectedEventoId) {
                                alert("Selecione um Evento primeiro.");
                                return;
                              }
                              setModalDataOperacao({
                                pjesEventoId: selectedEventoId,
                                omeId: eventoSelecionadoObj?.omeId ?? "",
                                mes: Number(mes),
                                ano: Number(ano),
                                userId: userId,
                                statusOperacao: "AUTORIZADA",
                              });
                              setMostrarModalOperacao(true);
                            }}
                          >
                            <div>
                              <FaPlus color="#4400ff" />
                            </div>
                        </div>
                        {/* FIM BOTAO DE ADIOCNAR OPERAÇÃO*/}
                      </div>

                      <ul>
                        {eventoExpandido && operacoesEvento.length > 0 ? (
                          operacoesEvento.map((op) => {
                            const isAberto = selectedOperacaoId === op.id;

                            return (
                              <li key={op.codOp} className={styles.operacaoImagemLi}>
                                <div className={styles.operacaoImagem}>
                                  <div className={styles.operacaoImagemSecundaria}>
                                    <Image
                                      src={getImagemUrlByCodVerba(op.codVerba)}
                                      alt="logo"
                                      width={40}
                                      height={40}
                                      style={{ borderRadius: "50%", padding: "5px" }}
                                    />
                                    <span style={{ marginLeft: "15px" }}>
                                      <span style={{ color: "#777474" }}>CODIGO DA OPERAÇÃO:</span>{" "}
                                      <strong>{op.codOp}</strong>
                                    </span>
                                  </div>
                                  <div className={styles.operacaoBotaoAddPms}>
                                    {/* botao add policiais */}
                                    <button
                                      disabled={!isAberto}
                                      onClick={() => {
                                        setModalDataEscala({
                                          pjesOperacaoId: op.id,
                                          mes: Number(mes),
                                          ano: Number(ano),
                                          userId: userId,
                                          statusEscala: "AUTORIZADA",
                                        });
                                        setMostrarModalEscala(true);
                                      }}
                                      className={styles.operacaoBotaoAddPmsReal}
                                      style={{
                                        cursor: isAberto
                                          ? "pointer"
                                          : "not-allowed",
                                        opacity: isAberto ? 1 : 0.3,
                                      }}
                                    >
                                      ADICIONAR POLICIAIS
                                    </button>

                                    {/* botao editar operação */}
                                    <button
                                      disabled={!isAberto}
                                      onClick={() => {
                                        setModalDataOperacao(op);
                                        setMostrarModalOperacao(true);
                                      }}
                                      className={styles.operacaoBotaoEditarPmsReal}
                                      style={{
                                        cursor: isAberto
                                          ? "pointer"
                                          : "not-allowed",
                                        opacity: isAberto ? 1 : 0.3,
                                        paddingLeft: "10px",
                                        paddingRight: "10px",
                                      }}
                                    >
                                      <FaEdit />
                                    </button>

                                    {/* botao excluir operação */}
                                    <button
                                      disabled={!isAberto}
                                      onClick={() => handleExcluirOperacao(op.id)}
                                      className={styles.operacaoBotaoExcluirPmsReal}
                                      style={{
                                        cursor: isAberto
                                          ? "pointer"
                                          : "not-allowed",
                                        opacity: isAberto ? 1 : 0.3,
                                        paddingLeft: "10px",
                                        paddingRight: "10px",
                                      }}
                                    >
                                      <FaTrash />
                                    </button>

                                    {/* inicio botao gerar pdf */}
                                    <button
                                      disabled={!isAberto}
                                      onClick={() => {
                                        // codOp que pode conter "/", separar em segmentos para a rota catch-all
                                        const codOpPath = op.codOp
                                          .split("/")
                                          .map(encodeURIComponent)
                                          .join("/");

                                        // abre a rota do Next.js que vai chamar sua API e baixar o PDF
                                        window.open(
                                          `/api/pjesoperacao/pdf-codop/${codOpPath}?mes=${mes}&ano=${ano}`,
                                          "_blank"
                                        );
                                      }}
                                      className={styles.operacaoBotaoPdfPmsReal}
                                      style={{
                                        cursor: isAberto ? "pointer" : "not-allowed",
                                        opacity: isAberto ? 1 : 0.3,
                                        paddingLeft: "10px",
                                        paddingRight: "10px",
                                      }}
                                    >
                                      <FaFilePdf />
                                    </button>
                                    {/* fim botao gerar pdf */}
                                  </div>

                                </div>

                                <div className={styles.operacaoNomeTabela}>
                                  <div
                                    className={styles.operacaoNomeClickTabela}
                                    style={{
                                      fontWeight: isAberto ? "bold" : "normal",
                                      background: isAberto ? "#2a6fa8" : "#7d7e80",
                                    }}
                                    onClick={() => fetchEscalasDaOperacao(op.id)}
                                  >
                                    <div style={{ flex: 2 }}>
                                      {op.nomeOme} | {op.nomeOperacao || "Operação"}
                                    </div>

                                    <div className={styles.operacaoIconOfPrc}>
                                      <FaStar /> {op.ttCtOfOper} | {op.ttCtOfExeOper}
                                    </div>

                                    <div className={styles.operacaoIconOfPrc}>
                                      <FaForward /> {op.ttCtPrcOper} | {op.ttCtPrcExeOper}
                                    </div>
                                  </div>
                                </div>

                                {/* Só renderiza se estiver aberta */}
                                {isAberto && (
                                  <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                    <table
                                      className={styles["tabela-zebra"]}
                                      style={{
                                        width: "100%",
                                        fontSize: "12px",
                                        borderCollapse: "collapse",
                                        borderBottom: "2px solid black",
                                      }}
                                    >
                                      <thead>
                                        <tr style={{ background: "#0d5997", color: "white" }}>
                                          <th className={styles.operacaoTableTh}>IDENTIFICAÇÃO</th>
                                          <th className={styles.operacaoTableTh}>DATA E HORA</th>
                                          <th className={styles.operacaoTableTh}>APRESENTAÇÃO</th>
                                          <th className={styles.operacaoTableTh}>TELEFONE</th>
                                          <th className={styles.operacaoTableTh}>FUNÇÃO</th>
                                          <th className={styles.operacaoTableTh}>SITUAÇÃO</th>
                                          <th className={styles.operacaoTableTh}>ANOTAÇÕES</th>
                                          <th className={styles.operacaoTableTh}>AÇÕES</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                          {(escalasOperacao[op.id] || [])
                                            .filter((escala) => {
                                              const busca = buscaEscala.toLowerCase();
                                              return (
                                                String(escala.nomeGuerraSgp || "")
                                                .toLowerCase()
                                                .includes(busca) ||
                                              String(escala.pgSgp || "")
                                                .toLowerCase()
                                                .includes(busca) ||
                                              String(escala.matSgp || "")
                                                .toLowerCase()
                                                .includes(busca)
                                              
                                              );
                                            })
                                            .map((escala) => (
                                        
                                          <tr key={escala.id}>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.pgSgp} {escala.matSgp} {escala.nomeGuerraSgp}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {new Date(escala.dataInicio + 'T00:00:00').toLocaleDateString("pt-BR")} {" "}
                                              {escala.horaInicio.slice(0, 5)} às{" "} {escala.horaFinal.slice(0, 5)}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.localApresentacaoSgp}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.phone}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.funcao}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.situacaoSgp}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              {escala.anotacaoEscala}
                                            </td>
                                            <td style={{ textAlign: "center"}}>
                                              <div style={{ display:"flex", alignContent:"center", alignItems:"center" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center"}}>
                                                  <div style={{ marginRight: "5px", padding: "2px", cursor: "pointer",}}
                                                    onClick={() => handleEditarEscala(escala)} title="Editar escala">
                                                    <FaEdit color="red" />
                                                  </div>
                                                </div>
                                                <div style={{ display: "inline-flex", alignItems: "center"}}>
                                                  <div style={{ marginRight: "5px", padding: "2px", cursor: "pointer",}}
                                                    onClick={() => handleExcluirEscala(escala.id)} title="Excluir escala">
                                                    <FaTrash color="red" />
                                                  </div>
                                                </div>  
                                                <div style={{ fontSize:"12px" }}>({cotasTotais[escala.matSgp] !== undefined ? cotasTotais[escala.matSgp] : <FaClock />})</div>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </li>
                            );
                          })
                        ) : eventoExpandido && operacoesEvento.length === 0 ? (
                          <li style={{ padding: "1rem" }}>Nenhuma operação encontrada para este evento.</li>
                        ) : (
                          <li style={{ padding: "1rem", color: "#888" }}>
                            Clique em um evento para visualizar suas operações.
                          </li>
                        )}
                      </ul>
                    </div>
                  {/* FIM OPERAÇÕES */}


            </div>
            
        </div>
      )}

      <DistribuicaoModal
        isOpen={mostrarModal}
        onClose={() => {
          setMostrarModal(false);
          setModalData(null);
        }}
        onSubmit={async (dados) => {
          const isEdit = Boolean(dados.id);
          const url = isEdit
            ? `/api/pjesdist/${dados.id}`
            : "/api/pjesdist";
          const method = isEdit ? "PUT" : "POST";
        
          // Mostra toast de carregamento
          const loadingToastId = toast.loading("Salvando distribuição...");
        
          try {
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            });
        
            const result = await res.json();
        
            if (!res.ok) {
              toast.update(loadingToastId, {
                render: result.error || "Erro ao salvar distribuição.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return;
            }
        
            if (isEdit) {
              setDistribuicoes((prev) =>
                prev.map((d) => (d.id === result.id ? result : d))
              );
            } else {
              setDistribuicoes((prev) => [...prev, result]);
            }
        
            toast.update(loadingToastId, {
              render: "Distribuição salva com sucesso!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
        
            setMostrarModal(false);
            setModalData(null);
          } catch (error) {
            console.error("Erro ao salvar distribuição:", error);
        
            toast.update(loadingToastId, {
              render: "Erro interno ao salvar distribuição.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          }
        }}
        
        tetos={tetos}
        selectedTetoId={tetoSelecionado?.id ?? null}
        mes={Number(mes)}
        ano={Number(ano)}
        userId={userId ?? 0}
        initialData={modalData}
      />

      <EventoModal
        isOpen={mostrarModalEvento}
        onClose={() => {
          setMostrarModalEvento(false);
          setModalDataEvento(null);
        }}
        onSubmit={async (dados) => {
          const isEdit = Boolean(dados.id);

          const params = new URLSearchParams({
            ano: String(ano),
            mes: String(mes),
          });

          const url = isEdit
            ? `/api/pjesevento/${dados.id}?${params.toString()}`
            : `/api/pjesevento?${params.toString()}`;

          const method = isEdit ? "PUT" : "POST";

          const toastId = toast.loading(isEdit ? "Atualizando evento..." : "Criando evento...");

          try {
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            });

            const text = await res.text();
            let result;

            try {
              result = JSON.parse(text);
            } catch {
              console.error("Resposta não é JSON válido:", text);
              toast.update(toastId, {
                render: "Erro inesperado ao salvar evento.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return false;
            }

            if (!res.ok) {
              toast.update(toastId, {
                render: result?.error || "Erro ao salvar evento.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return false;
            }

            // ✅ Atualiza lista de eventos
            if (selectedDistId && tetoSelecionado?.codVerba) {
              await fetchEventosPorDistribuicao(selectedDistId, tetoSelecionado.codVerba, true);
            }

            toast.update(toastId, {
              render: isEdit ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });

            setMostrarModalEvento(false);
            setModalDataEvento(null);
            return true;
          } catch (error) {
            console.error("Erro ao salvar evento:", error);

            toast.update(toastId, {
              render: "Erro interno ao salvar evento.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });

            return false;
          }
        }}
        mes={Number(mes)}
        ano={Number(ano)}
        userId={userId ?? 0}
        initialData={modalDataEvento}
        dists={pjesdist}
        selectedDistId={selectedDistId}
      />

      <OperacaoModal
        isOpen={mostrarModalOperacao}
        onClose={() => {
          setMostrarModalOperacao(false);
          setModalDataOperacao(null);
        }}
        onSubmit={async (dados) => {
          const isEdit = Boolean(dados.id);
        
          const params = new URLSearchParams({
            ano: String(ano),
            mes: String(mes),
          });
        
          const url = isEdit
            ? `/api/pjesoperacao/${dados.id}?${params.toString()}`
            : `/api/pjesoperacao?${params.toString()}`;
        
          const method = isEdit ? "PUT" : "POST";
        
          const toastId = toast.loading(isEdit ? "Salvando operação..." : "Adicionando operação...");
        
          try {
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            });
        
            const text = await res.text();
            type Operacao = any;
            let result: Operacao;
        
            try {
              result = JSON.parse(text);
            } catch {
              console.error("Resposta não é JSON válido:", text);
              toast.update(toastId, {
                render: "Erro inesperado ao salvar Operação.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return false;
            }
        
            if (!res.ok) {
              toast.update(toastId, {
                render: result?.error || "Erro ao salvar operação.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
              return false;
            }
        
            setMostrarModalOperacao(false);
            setModalDataOperacao(null);
        
            if (isEdit) {
              // Atualiza operação editada
              setOperacoesEvento((prev) =>
                prev.map((op) => (op.id === result.id ? result : op))
              );
            } else {
              // ✅ Adiciona nova operação à lista
              setOperacoesEvento((prev) => [...prev, result]);
            }
        
            toast.update(toastId, {
              render: isEdit ? "Operação atualizada com sucesso!" : "Operação adicionada com sucesso!",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
        
            return true;
          } catch (error) {
            console.error("Erro ao salvar Operação:", error);
            toast.update(toastId, {
              render: "Erro interno ao salvar operação.",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
            return false;
          }
        }}

        mes={Number(mes)}
        ano={Number(ano)}
        userId={userId ?? 0}
        initialData={modalDataOperacao}
        selectedEventoId={selectedEventoId}
        selectedOperacaoId={selectedOperacaoId} // <== PASSE ESSA PROP
        eventos={[]}
      />

      <EscalaModal
        isOpen={mostrarModalEscala}
        onClose={() => {
          setMostrarModalEscala(false);
          setModalDataEscala(null);
        }}
        onSuccess={async () => {
          setMostrarModalEscala(false);
          setModalDataEscala(null);
        }}
        onSubmit={salvarOuAtualizarEscala}
        mes={Number(mes)}
        ano={Number(ano)}
        userId={userId ?? 0}
        initialData={modalDataEscala}
        selectedOperacaoId={selectedOperacaoId}
        omeId={eventoSelecionadoObj?.omeId ?? 0}
        pjesEventoId={selectedEventoId ?? 0}
        operacoes={eventoSelecionadoObj?.pjesoperacoes ?? []}
      />

      <PrestacaoContasModal
        isOpen={mostrarModalPrestacaoContas}
        onClose={() => setMostrarModalPrestacaoContas(false)}

        onSubmit={async (regularOuAtrasado) => {
          setMostrarModalPrestacaoContas(false);
          setIsBaixandoExcel(true);

          const query = new URLSearchParams({
            ano: String(ano),
            mes: String(mes),
            regularOuAtrasado,
          });

          try {
            const res = await fetch(`/api/pjesescala/excel?${query.toString()}`);

            if (!res.ok) {
              let errorMessage = "Erro ao baixar Excel.";

              try {
                const cloned = res.clone(); // 👈 Clona a resposta
                const errorData = await cloned.json(); // Tenta parsear JSON
                if (errorData?.message) {
                  errorMessage = errorData.message;
                }
              } catch (parseError) {
                console.warn("Erro ao interpretar resposta JSON do backend:", parseError);
              }

              toast.error(errorMessage);
              return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const nomeMes = (mes: number) => {
              const nomes = [
                "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
                "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
              ];
              return nomes[mes - 1] ?? "";
            };

            const rawNomeOme = user?.ome?.nomeOme ?? "OME";
            const nomeSanitizado = removerCaracteresEspeciais(rawNomeOme);

            if (mes === null) {
              toast.error("Erro: mês não definido para gerar o arquivo.");
              return;
            }

            const nomeMesAbreviado = nomeMes(mes);
            const nomeArquivo = `GENESIS_PJES_${nomeSanitizado}_${nomeMesAbreviado}_${ano}.xlsx`;

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", nomeArquivo);
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Erro inesperado ao baixar Excel:", err);
            toast.error("Erro inesperado ao baixar Excel.");
          } finally {
            setIsBaixandoExcel(false);
          }
        }}
      />


    </div>
  );
}
