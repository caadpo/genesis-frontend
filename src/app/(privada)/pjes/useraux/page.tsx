"use client";

import { useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { usePjesAuxData, Evento } from "../hooks/usePjesAuxData";
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
import { FaBars } from 'react-icons/fa';
import PrestacaoContasModal from "@/components/ModalPrestacaoContas";
import { toast } from "react-toastify";
import EventoModal from "@/components/EventoModal";
import OperacaoModal from "@/components/OperacaoModal";
import EscalaModal from "@/components/EscalaModal";

const mapaMesesTexto: { [key: number]: string } = {
  1: "JAN", 2: "FEV", 3: "MAR", 4: "ABR", 5: "MAI", 6: "JUN",
  7: "JUL", 8: "AGO", 9: "SET", 10: "OUT", 11: "NOV", 12: "DEZ",
};

export default function UserAuxPage() {
  const searchParams = useSearchParams();
  const user = useUser();
  const userId = user?.id;
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const [pjesdist, setPjesdist] = useState<any[]>([]);
  const [buscaEventos, setBuscaEventos] = useState("");
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalDataEvento, setModalDataEvento] = useState<any | null>(null);
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [eventoExpandido, setEventoExpandido] = useState<number | null>(null);
  
  const [operacoesEvento, setOperacoesEvento] = useState<any[]>([]);
  const [escalasOperacao, setEscalasOperacao] = useState<{ [key: number]: any[] }>({});

  const [selectedOperacaoId, setSelectedOperacaoId] = useState<number | null>(null);
  const [mostrarModalOperacao, setMostrarModalOperacao] = useState(false);
  const [modalDataOperacao, setModalDataOperacao] = useState<any | null>(null);

  const [mostrarModalEscala, setMostrarModalEscala] = useState(false);
  const [modalDataEscala, setModalDataEscala] = useState<any | null>(null);

  const [mostrarModalPrestacaoContas, setMostrarModalPrestacaoContas] = useState(false);
  const [isBaixandoExcel, setIsBaixandoExcel] = useState(false);

  const [operacaoSelecionada, setOperacaoSelecionada] = useState<any | null>(null);
  const [buscaEscala, setBuscaEscala] = useState("");
  const [escalas, setEscalas] = useState<any[]>([]);
  const [carregandoEscalas, setCarregandoEscalas] = useState(false);
  const [impedidosPorEvento, setImpedidosPorEvento] = useState<Record<number, number>>({});
  const [cotasTotais, setCotasTotais] = useState<Record<number, number>>({});

  
    useEffect(() => {
      const anoParam = searchParams.get("ano");
      const mesParam = searchParams.get("mes");

      if (anoParam && mesParam) {
        const mapaMeses: { [key: string]: number } = {
          JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
          JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
        };

        const mesNum = mapaMeses[mesParam.toUpperCase()];
        if (mesNum) {
          setAno(Number(anoParam));
          setMes(mesNum);
        } else {
          console.warn("Mês inválido no parâmetro:", mesParam);
        }
      }
    }, [searchParams]);

    const { tetos, tetoSelecionado, eventosOme, handleTetoClick, loading, refreshEventos } = usePjesAuxData( ano, mes, user?.omeId ?? null);

    useEffect(() => {
      if (!eventoSelecionado && eventosOme && eventosOme.eventos.length > 0) {
        setSelectedEventoId(eventosOme.eventos[0].id);
      }
    }, [eventosOme]);
    

    const eventoSelecionado = eventosOme?.eventos.find(e => e.id === selectedEventoId) || null;

    async function carregarEventoComOperacoes(evento: Evento) {
      try {
        const res = await fetch(`/api/pjesoperacao?ano=${ano}&mes=${mes}`);
        const operacoes = await res.json();
    
        const operacoesDoEvento = operacoes.filter(
          (op: any) => op.pjesEventoId === evento.id
        );
    
        const eventoComOperacoes = {
          ...evento,
          pjesoperacoes: operacoesDoEvento,
        };
    
        setSelectedEventoId(evento.id);
        setOperacoesEvento(operacoesDoEvento);
      } catch (error) {
        console.error("Erro ao buscar operações:", error);
        setSelectedEventoId(evento.id);
        setOperacoesEvento([]); 
      }
    }

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

    // Função para remover acentos e caracteres especiais e trocar espaços por _
    function removerCaracteresEspeciais(str: string): string {
      return str
        .replace(/[^ -~]+/g, "") // remove todos os caracteres não ASCII visíveis (como º, ª, Â)
        .normalize("NFD") // normaliza acentos
        .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
        .replace(/[^a-zA-Z0-9\s]/g, "") // remove outros símbolos especiais
        .replace(/\s+/g, "_"); // substitui espaços por _
    }

    async function buscarEscalas(operacaoId: number) {
      if (!ano || !mes) return;
      try {
        setCarregandoEscalas(true);
        const res = await fetch(`/api/pjesescala?operacaoId=${operacaoId}&ano=${ano}&mes=${mes}`);
        const data = await res.json();
        setEscalas(data);
      } catch (e) {
        console.error("Erro ao carregar escalas:", e);
        setEscalas([]);
      } finally {
        setCarregandoEscalas(false);
      }
    }

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
        } catch (error) {
          console.error("Erro ao buscar impedidos por evento:", error);
        }
      };
    
      fetchImpedidosPorEvento();
    }, [ano, mes]);
    //Buscar impedidos por evento e a soma total

    const getImagemUrlByCodVerba = (codVerba: string) => {
      const teto = tetos.find((t) => t.codVerba === codVerba);
      return teto?.imagemUrl || "/assets/images/default_logo.png";
    };

    const getNomeDiretoriaOrigemByEvento = (evento: any) => {
      return (
        evento?.pjesdist?.diretoria?.nomeDiretoria ??
        evento?.nomeDiretoria ??
        "DIRETORIA"
      );
    };

    const [abaAtiva, setAbaAtiva] = useState<"diretorias" | "convenios">("diretorias");
    const somattCtOfEvento: number = eventosOme?.eventos.reduce((acc, evento) => acc + (evento.ttCtOfEvento || 0), 0) || 0;
    const somattCtPrcEvento: number = eventosOme?.eventos.reduce((acc, evento) => acc + (evento.ttCtPrcEvento || 0), 0) || 0;
    const somattCtOfExeOper: number = eventosOme?.eventos.flatMap(evento => evento.pjesoperacoes || []).reduce(
      (acc, oper) => acc + (oper.ttCtOfExeOper || 0), 0
      ) || 0;
    const somattCtPrcExeOper: number = eventosOme?.eventos.flatMap(evento => evento.pjesoperacoes || []).reduce(
      (acc, oper) => acc + (oper.ttCtPrcExeOper || 0), 0
      ) || 0;
    const totalPlanejado = (somattCtOfEvento * 300 || 0) + (somattCtPrcEvento * 200 || 0);
    const totalExecutado = (somattCtOfExeOper * 300 || 0) + (somattCtPrcExeOper * 200 || 0);
    const saldo = totalPlanejado - totalExecutado;


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
  
        // Mostra toast de sucesso
        toast.success(`Evento ${acao} com sucesso.`);
    
        // Fecha o menu
        setMenuAbertoId(null);
      } catch (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro interno ao alterar status");
      }
    };

    const fetchDadosDoEvento = async (eventoId: number) => {
      try {
        const res = await fetch(`/api/pjesevento/${eventoId}`);
        if (!res.ok) throw new Error("Erro ao buscar evento");
    
        const data = await res.json();
        setOperacoesEvento(data.pjesoperacoes || []);
    
      } catch (err) {
        console.error("Erro ao buscar evento:", err);
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
      } catch (err) {
        console.error("Erro ao buscar operações:", err);
      }
    };

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
        await refreshEventos();
    
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
      if (!dados.pjesEventoId) {
        dados = {
          ...dados,
          pjesEventoId: eventoSelecionado?.id,
        };
      }
    
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
    
        // Atualiza corretamente a lista
        setEscalasOperacao((prev) => {
          const operacaoId = dados.pjesOperacaoId;
          const escalas = prev[operacaoId] || [];
    
          const novasEscalas = isEdit
            ? escalas.map((e: any) => (e.id === result.id ? result : e))
            : [...escalas, result];
    
          // Atualizar os totais da operação
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

        await refreshEventos();
        await buscarEscalas(dados.pjesOperacaoId);

    
        toast.update(toastId, {
          render: isEdit
            ? "Escala atualizada com sucesso!"
            : "Escala adicionada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
    
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
    
        await refreshEventos();
        if (selectedOperacaoId !== null) {
          await buscarEscalas(selectedOperacaoId);
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
      

      useEffect(() => {
        if (selectedEventoId && modalDataOperacao && !mostrarModalOperacao) {
          setMostrarModalOperacao(true);
        }
      }, [selectedEventoId, modalDataOperacao]);


      //Paginar e contar os registros da tabela
        const [paginaAtual, setPaginaAtual] = useState(1);
        const registrosPorPagina = 80;

        const escalasFiltradas = escalas.filter((escala) =>
          [escala.pgSgp, escala.matSgp, escala.nomeGuerraSgp, escala.funcao, escala.localApresentacaoSgp]
            .join(" ")
            .toLowerCase()
            .includes(buscaEscala.toLowerCase())
        );

        const totalPaginas = Math.ceil(escalasFiltradas.length / registrosPorPagina);
        const escalasPaginadas = escalasFiltradas.slice(
          (paginaAtual - 1) * registrosPorPagina,
          paginaAtual * registrosPorPagina
        );
      //Paginar e contar os registros da tabela

      

    return (
    <div className={styles.divReturn}>
      {loading ? <p>Carregando dados...</p> : ( 
      <div className={styles.divReturn}>
        <h3 className={styles.divTetoSecundaria}>PJES {mapaMesesTexto[mes!]} | {ano}</h3>
        <div className={styles.divInterna}>
          {/* TETO PRINCIPAL */}
          <div className={styles.divTetoPrincipal}>
            <ul className={styles.ulTeto}>
              {tetos.length === 0 && <p>Nenhum teto disponível.</p>}
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
          </div>
          {/* TETO PRINCIPAL */}

          <div style={{ display: "flex", flex: 1, height:"100%", marginTop:"5px", border: "1px solid #cac3c3" }}>
            {/* INICIO RESUMO POR DIRETORIA */}
            <div className={styles.eventoPrincipalAux}>
              <div className={styles.larguraDiretoriaAux}>
                <div className={styles.abasContainer}>
                  <button className={ abaAtiva === "diretorias" ? styles.abaAtiva : styles.aba} onClick={() => setAbaAtiva("diretorias")}>
                    {eventosOme?.nomeOme} | {tetoSelecionado?.nomeVerba}
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
                    <tr>
                      <td>{eventosOme?.nomeOme}</td>
                      <td>{tetoSelecionado?.codVerba}</td>
                      <td>{somattCtOfEvento} | {somattCtOfExeOper}</td>
                      <td>{somattCtPrcEvento} | {somattCtPrcExeOper}</td>
                      <td><FaCheck /></td>
                    </tr>

                    </tbody>
                  </table>

                  <div className={styles.resumoPrincipalOme}>
                    <h3 className={styles.h3ResumoOme}><strong>Planejado:</strong></h3>
                    <span className={styles.spanResumoOme}>
                      R$ {totalPlanejado.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <hr className={styles.hrResumoOme} />

                  <div className={styles.resumoPrincipalOme}>
                    <h3 className={styles.h3ResumoOme}><strong>Executado:</strong></h3>
                    <span className={styles.spanResumoOme}>
                      R$ {totalExecutado.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <hr className={styles.hrResumoOme} />

                  <div className={styles.resumoSaldoOme}>
                    <h3 className={styles.h3ResumoOme}><strong>Saldo:</strong></h3>
                    <span className={styles.spanResumoOme}>
                      R$ {saldo.toLocaleString("pt-BR")}
                    </span>
                  </div>
              </div>
            </div>
            {/* FIM RESUMO POR DIRETORIA */}

            {/* INICIO EVENTOS */}
            {eventosOme ? (
                <>
                <div style={{display:"flex", width:"80%"}}>
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
                                alert("Usuario sem Autorização");
                                return;
                              }
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
                    <div>
                      <div>
                        <div>
                        <ul>
                        {eventosOme.eventos.filter((evento) => 
                          evento.nomeEvento.toLowerCase().includes(buscaEventos.toLowerCase())).map((evento) => {
                            const imagemUrl = getImagemUrlByCodVerba(evento.codVerba);
                            const isEventoSelecionado = eventoSelecionado?.id === evento.id;
                            return (
                              
                              <li
                                key={evento.id}
                                className={styles.eventoImagemLi}
                                onClick={() => {
                                  setSelectedEventoId(evento.id);
                                  setOperacaoSelecionada(null);
                                  setSelectedOperacaoId(null);
                                }}                                    
                                style={{
                                  cursor: "pointer",
                                  fontWeight: isEventoSelecionado ? "bold" : "normal",
                                  color: isEventoSelecionado ? "blue" : "black",
                                  backgroundColor: isEventoSelecionado ? "#d6eaff" : "transparent", // cor de fundo clara azul
                                  borderRadius: "5px",
                                  padding: "5px",
                                }}
                                >

                                {/* Imagem do evento */}
                                <div className={styles.eventoImagem}>
                                  <Image
                                      src={imagemUrl}
                                      alt="logo"
                                      width={30}
                                      height={30}
                                      style={{ borderRadius: "50%" }}
                                    />
                                </div>

                                {/* Texto do evento */}
                                <div style={{ flex: 1}}>
                                  <div className={styles.eventoTextoADireita}>
                                    {eventosOme?.nomeOme && (<p>{eventosOme.nomeOme}</p>)}
                                    {evento.nomeEvento}
                                  </div>
                                  <div className={styles.conteudoEvento}>
                                  {(() => {
                                      const operacoes = evento.pjesoperacoes || [];
                                      const ttCtOfExeOper = operacoes.reduce((sum, op) => sum + (op.ttCtOfExeOper || 0), 0);
                                      const ttCtPrcExeOper = operacoes.reduce((sum, op) => sum + (op.ttCtPrcExeOper || 0), 0);

                                      return (
                                        <>
                                          <span style={{ paddingRight: "20px" }}>
                                            Oficiais: {evento.ttCtOfEvento} | {ttCtOfExeOper}
                                          </span>
                                          <span style={{ paddingRight: "20px" }}>
                                            Praças: {evento.ttCtPrcEvento} | {ttCtPrcExeOper}
                                          </span>
                                        </>
                                      );
                                    })()}

                                    <FaUserSlash color="orange" style={{ marginRight: "5px" }} />
                                    {impedidosPorEvento[evento.id] ?? 0}
                                  </div>
                                </div>

                                {/* Status do evento */}
                                  <div style={{ fontSize: "20px", paddingTop: "5px" }} onClick={() => handleToggleStatus(evento)}>
                                    <div style={{ fontSize: "20px", paddingBottom: "5px", marginRight: "33px",}}>
                                      {evento.statusEvento === "AUTORIZADA" ? (
                                        <FaLockOpen color="green" title="Homologar Evento" />
                                      ) : evento.statusEvento === "HOMOLOGADA" ? (
                                        <FaLock color="red" title="Evento Homologado" />
                                      ) : null}
                                    </div>
                                  </div>
                              </li>
                            );
                          })}
                        </ul>

                        </div>
                      </div>
                    </div>
                  </div>
                  {/* FIM EVENTOS */}

                  {/* INICIO OPERAÇÕES */}
                  {eventoSelecionado && (
                  <>
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
                          if (!eventoSelecionado) {
                            alert("Selecione um Evento primeiro.");
                            return;
                          }
                        
                          const eventoId = eventoSelecionado.id;                            
                          setSelectedEventoId(eventoId);
                          setModalDataOperacao({
                            pjesEventoId: eventoId,
                            omeId: eventoSelecionado?.omeId ?? "",
                            mes: Number(mes),
                            ano: Number(ano),
                            userId: userId,
                            statusOperacao: "AUTORIZADA",
                          });
                      
                        }}
                        
                      >
                        <div>
                          <FaPlus color="#4400ff" />
                        </div>
                    </div>
                    {/* FIM BOTAO DE ADIOCNAR OPERAÇÃO*/}
                      </div>

                      {eventoSelecionado.pjesoperacoes &&
                        eventoSelecionado.pjesoperacoes.length > 0 ? (
                          <ul>
                          {eventoSelecionado.pjesoperacoes.map((oper) => {
                            const isAberto = operacaoSelecionada?.id === oper.id;
                        
                            return (
                              <li key={oper.id} className={styles.operacaoImagemLi}
                                onClick={() => {setOperacaoSelecionada(oper); buscarEscalas(oper.id);}}
                                style={{
                                  borderRadius: "5px",
                                  marginBottom: "10px",
                                  cursor: "pointer",
                                }}
                              >
                                {/* Cabeçalho da operação */}
                                <div className={styles.operacaoImagem}>
                                  <div className={styles.operacaoImagemSecundaria}>
                                    <Image
                                      src={getImagemUrlByCodVerba(oper.codVerba)}
                                      alt="logo"
                                      width={40}
                                      height={40}
                                      style={{ borderRadius: "50%", padding: "5px" }}
                                    />
                                      <span style={{ marginLeft: "15px" }}>
                                        <span style={{ color: "#777474" }}>CODIGO DA OPERAÇÃO:</span>{" "}
                                        <strong>{oper.codOp}</strong>
                                      </span>
                                  </div>
                        
                                  <div className={styles.operacaoBotaoAddPms}>
                                    {/* botao add policiais */}
                                    <button
                                      disabled={!isAberto}
                                      onClick={() => {
                                        setOperacaoSelecionada(oper);
                                        setSelectedOperacaoId(oper.id);
                                      
                                        setModalDataEscala({
                                          pjesEventoId: eventoSelecionado?.id,
                                          pjesOperacaoId: oper.id,
                                          mes: Number(mes),
                                          ano: Number(ano),
                                          userId: userId,
                                          statusEscala: "AUTORIZADA",
                                        });

                                        setMostrarModalEscala(true);
                                      }}
                                      
                                      className={styles.operacaoBotaoAddPmsReal}
                                      style={{
                                        cursor: isAberto ? "pointer" : "not-allowed",
                                        opacity: isAberto ? 1 : 0.3,
                                      }}
                                    >
                                      ADICIONAR POLICIAIS
                                    </button>


                                    {/* botao editar operação */}
                                      <button
                                        disabled={!isAberto}
                                        onClick={() => {
                                          setModalDataOperacao(oper);
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
                                        onClick={() => handleExcluirOperacao(oper.id)}
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
                                          const codOpPath = oper.codOp
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
                        
                                {/* Nome da operação */}
                                <div className={styles.operacaoNomeTabela}>
                                  <div className={styles.operacaoNomeClickTabela}
                                    onClick={() => fetchEscalasDaOperacao(oper.id)}
                                    style={{ fontWeight: isAberto ? "bold" : "normal", background: isAberto ? "#2a6fa8" : "#7d7e80", }}>
                                    <div style={{ flex: 2 }}>{oper.nomeOme} | {oper.nomeOperacao}</div>
                                    <div className={styles.operacaoIconOfPrc}><FaStar /> {oper.ttCtOfOper} | {oper.ttCtOfExeOper}</div>
                                    <div className={styles.operacaoIconOfPrc}><FaForward /> {oper.ttCtPrcOper} | {oper.ttCtPrcExeOper}</div>
                                  </div>
                                </div>
                        
                                {/* Exibe as escalas somente se for a operação selecionada */}
                                {isAberto && (
                                  <>
                                    {carregandoEscalas ? (
                                      <p>Carregando escalas...</p>
                                    ) : escalas.length > 0 ? (
                                      <div style={{ paddingLeft: "10px", paddingRight: "10px",}}>
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
                                            <tr style={{ background: "#0d5997", color: "white",}}>
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
                                            {escalasPaginadas.map((escala, index) => (
                                              <tr style={{ fontSize:"14px"}} key={index}>
                                                <td>{escala.pgSgp} {escala.matSgp} {escala.nomeGuerraSgp} {escala.omeSgp}</td>
                                                <td style={{ textAlign: "center"}}>
                                                  {new Date(escala.dataInicio + 'T00:00:00').toLocaleDateString("pt-BR")} {" "}
                                                  {escala.horaInicio.slice(0, 5)} às{" "} {escala.horaFinal.slice(0, 5)}
                                                </td>
                                                <td style={{ textAlign:"center"}}>{escala.localApresentacaoSgp}</td>
                                                <td style={{ textAlign:"center"}}>{escala.phone}</td>
                                                <td style={{ textAlign:"center"}}>{escala.funcao}</td>
                                                <td>{escala.situacaoSgp}</td>
                                                <td>{escala.anotacaoEscala}</td>
                                                <td>
                                                <div style={{ display:"flex", alignContent:"center", alignItems:"center" }}>
                                              <div style={{ display: "inline-flex", alignItems: "center"}}>
                                                <div style={{padding: "2px", cursor: "pointer",}}
                                                  onClick={() => handleEditarEscala(escala)} title="Editar escala">
                                                  <FaEdit color="orange" fontSize={"15px"} />
                                                </div>
                                              </div>
                                              <div style={{ display: "inline-flex", alignItems: "center"}}>
                                                <div style={{padding: "2px", cursor: "pointer",}}
                                                  onClick={() => handleExcluirEscala(escala.id)} title="Excluir escala">
                                                  <FaTrash color="red" fontSize={"14px"} />
                                                </div>
                                              </div>  
                                              <div style={{ fontSize:"12px" }}>({cotasTotais[escala.matSgp] !== undefined ? cotasTotais[escala.matSgp] : <FaClock />})</div>
                                            </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                                          <span style={{ fontSize: "14px" }}>
                                            Registros: <strong>{escalasFiltradas.length}</strong>
                                          </span>

                                          {totalPaginas > 1 && (
                                            <div>
                                              <button
                                                disabled={paginaAtual === 1}
                                                onClick={() => setPaginaAtual(paginaAtual - 1)}
                                                style={{ marginRight: "8px" }}
                                              >
                                                Anterior
                                              </button>

                                              <span style={{ fontSize: "14px", margin: "0 8px" }}>
                                                Página {paginaAtual} de {totalPaginas}
                                              </span>

                                              <button
                                                disabled={paginaAtual === totalPaginas}
                                                onClick={() => setPaginaAtual(paginaAtual + 1)}
                                              >
                                                Próxima
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                      </div>
                                    ) : (
                                      <p style={{padding:"20px", fontSize:"15px"}}>Nenhuma escala encontrada para esta operação.</p>
                                    )}
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        
                        ) : (
                          <p>Este evento não possui operações.</p>
                        )}
                    </div>

                    </>
                    )}
                  {/* FIM OPERAÇÕES */}
                </div>

                </>
              ) : (
                <p>Nenhum evento carregado.</p>
              )}
            {/* FIM EVENTOS */}
          </div>            
        </div>
      </div>
    )}



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
        let result: any;

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

        // Atualiza os eventos
        await refreshEventos();

        setMostrarModalOperacao(false);
        setModalDataOperacao(null);

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
    selectedOperacaoId={selectedOperacaoId}
    eventos={[]} // mantém vazio, a não ser que OperacaoModal use isso internamente
  />


  <EscalaModal
    isOpen={mostrarModalEscala}
    onClose={() => {
      setMostrarModalEscala(false);
      setModalDataEscala(null);
    }}
    onSuccess={async () => {
      // Recarrega eventos após salvar ou atualizar escala
      await refreshEventos();

      setMostrarModalEscala(false);
      setModalDataEscala(null);
    }}
    onSubmit={salvarOuAtualizarEscala}
    mes={Number(mes)}
    ano={Number(ano)}
    userId={userId ?? 0}
    initialData={modalDataEscala}
    selectedOperacaoId={selectedOperacaoId}
    omeId={eventoSelecionado?.omeId ?? 0}
    pjesEventoId={eventoSelecionado?.id ?? 0}
    operacoes={eventoSelecionado?.pjesoperacoes ?? []}
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
