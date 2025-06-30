"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../privateLayout.module.css";
import {
  FaCheck,
  FaCheckSquare,
  FaComment,
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
} from "react-icons/fa";
import DistribuicaoModal from "@/components/DistribuicaoModal";
import EventoModal from "@/components/EventoModal";
import OperacaoModal from "@/components/OperacaoModal";
import EscalaModal from "@/components/EscalaModal";
import ObsModal from "@/components/ObsModal";

export default function PjesPage() {
  const searchParams = useSearchParams();
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  const [pjestetos, setPjestetos] = useState<any[]>([]);
  const [pjesdists, setPjesdists] = useState<any[]>([]);
  const [pjeseventos, setPjeseventos] = useState<any[]>([]);
  const [pjesoperacoes, setPjesoperacoes] = useState<any[]>([]);
  const [pjesescalas, setPjesescalas] = useState<any[]>([]);
  const [selectedTetoId, setSelectedTetoId] = useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = useState<number | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);
  const [selectedOperacaoId, setSelectedOperacaoId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [mostrarTeto] = useState(true);
  const [mostrarDist] = useState(true);
  const [mostrarEvento] = useState(true);
  const [mostrarOperacao] = useState(true);
  const [busca, setBusca] = useState("");
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const toggleMenu = (id: number) => {
    setMenuAbertoId((prev) => (prev === id ? null : id));
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const escalasPorPagina = 50;

  // Carrega operações somente quando um evento é clicado
  const carregarOperacoesDoEvento = async (eventoId: number) => {
  try {
    const res = await fetch("/api/pjesoperacao");
    const operacoes = await res.json();

    const operacoesFiltradas = operacoes.filter(
      (op: any) => op.pjesEventoId === eventoId
    );

    setPjesoperacoes(operacoesFiltradas);

    const todasAsEscalas = operacoesFiltradas.flatMap(
      (op: any) => op.pjesescalas || []
    );
    setPjesescalas(todasAsEscalas);
  } catch (error) {
    console.error("Erro ao carregar operações:", error);
  }
};


  const mapMes: Record<string, number> = {
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

  const mesNum = mapMes[(mes || "").toUpperCase().trim()];

  function formatarDataISOParaBR(isoDateString: string) {
    const [ano, mes, dia] = isoDateString.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  {
   


  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);

  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [modalDataEvento, setModalDataEvento] = useState<any | null>(null);
  const fetchEventos = async () => {
    try {
      const res = await fetch("/api/pjesevento");
      const data = await res.json();
      setPjeseventos(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  const [mostrarModalOperacao, setMostrarModalOperacao] = useState(false);
  const [modalDataOperacao, setModalDataOperacao] = useState<any | null>(null);
  const fetchOperacoes = async () => {
    try {
      const res = await fetch("/api/pjesoperacao");
      const data = await res.json();
      setPjesoperacoes(data);
    } catch (error) {
      console.error("Erro ao carregar Operacao:", error);
    }
  };

  const buscarOperacoes = async (): Promise<any[]> => {
    try {
      const res = await fetch("/api/pjesoperacao");
      const data = await res.json();
      return data; // ✅ Agora retorna os dados!
    } catch (error) {
      console.error("Erro ao buscar operações:", error);
      return [];
    }
  };

  const [mostrarModalEscala, setMostrarModalEscala] = useState(false);
  const [modalDataEscala, setModalDataEscala] = useState<any | null>(null);
  
  const [mostrarModalObs, setMostrarModalObs] = useState(false);
  const [modalDataObs, setModalDataObs] = useState<any | null>(null);

  const handleAbrirObs = (escala: any) => {
    setModalDataObs(escala);
    setMostrarModalObs(true);
  };


  const fetchEscalas = async () => {
    try {
      const res = await fetch("/api/pjesescala");
      const data = await res.json();

      // 🚨 Garante novo array mesmo com dados idênticos
      setPjesescalas([...data]);
    } catch (error) {
      console.error("Erro ao carregar Escala:", error);
    }
  };

  const userId = 1;

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resTeto, resDist, resEvento] = await Promise.all([
          fetch("/api/pjesteto"),
          fetch("/api/pjesdist"),
          fetch("/api/pjesevento"),
        ]);

        const tetos = await resTeto.json();
        const dists = await resDist.json();
        const eventos = await resEvento.json();

        setPjestetos(
          tetos.filter(
            (item: any) => item.ano === Number(ano) && item.mes === mesNum
          )
        );
        setPjesdists(
          dists.filter(
            (item: any) => item.ano === Number(ano) && item.mes === mesNum
          )
        );
        setPjeseventos(
          eventos.filter(
            (item: any) => item.ano === Number(ano) && item.mes === mesNum
          )
        );

        if (tetos.length > 0) setSelectedTetoId(tetos[0].id);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ano && mes) {
      fetchDados();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbertoId(null);
      }
    };

    if (menuAbertoId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTetoClick = (id: number) => {
    setSelectedTetoId(id);
    setSelectedDistId(null);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleDistClick = (id: number) => {
    setSelectedDistId(id);
    setSelectedEventoId(null);
    setSelectedOperacaoId(null);
  };

  const handleEventoClick = async (id: number) => {
    setSelectedEventoId(id);
    setSelectedOperacaoId(null);
    setPjesoperacoes([]); // limpa anteriores
    setPjesescalas([]); // limpa escalas antigas
    await carregarOperacoesDoEvento(id);
  };

  const handleOperacaoClick = (id: number) => {
  const novoId = selectedOperacaoId === id ? null : id;
  setSelectedOperacaoId(novoId);
};


  const menuItemStyle = {
    padding: "8px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "13px",
    borderBottom: "1px solid #444",
  };

  const distSelecionado = pjesdists.filter(
    (dist) => dist.pjesTetoId === selectedTetoId
  );

  const eventoSelecionado = selectedDistId
    ? pjeseventos.filter((evento) => evento.pjesDistId === selectedDistId)
    : pjeseventos;

  const operacaoSelecionado = pjesoperacoes.filter(
    (op) => op.pjesEventoId === selectedEventoId
  );

  const getImagemPorCodVerba = (codVerba: number): string => {
    switch (codVerba) {
      case 247:
        return "/assets/images/dpo_logo.png";
      case 263:
        return "/assets/images/pe_logo.png";
      case 255:
        return "/assets/images/mobi_logo.png";
      case 251:
        return "/assets/images/alepe_logo.png";
      case 253:
        return "/assets/images/mppe_logo.jpg";
      case 250:
        return "/assets/images/brasil_logo.png";
      default:
        return "/assets/images/logo.png"; // imagem padrão
    }
  };

  const handleEditarEvento = (evento: any) => {
    setModalDataEvento(evento);
    setMostrarModalEvento(true);
  };

  const handleExcluirEvento = async (eventoId: number) => {
    const confirmar = confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/pjesevento/${eventoId}`, {
        method: "DELETE",
      });

      const resultado = await res.json();

      if (!res.ok) {
        alert(resultado?.error || "Erro ao excluir evento.");
        return;
      }

      setPjeseventos((prev) => prev.filter((ev) => ev.id !== eventoId));
      alert("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Erro interno ao excluir.");
    }
  };

  const handleToggleStatus = async (evento: any) => {
    const novoStatus =
      evento.statusEvento === "AUTORIZADA" ? "HOMOLOGADA" : "AUTORIZADA";

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

      // ✅ Atualiza a lista de eventos corretamente
      setPjeseventos((prevEventos: any[]) =>
        prevEventos.map((ev) =>
          ev.id === evento.id ? { ...ev, statusEvento: novoStatus } : ev
        )
      );

      setMenuAbertoId(null); // Fecha menu após ação
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro interno ao alterar status");
    }
  };

  const eventoSelecionadoObj = pjeseventos.find(
    (e) => e.id === selectedEventoId
  );

  const [cotasPorMatricula, setCotasPorMatricula] = useState<{
    [mat: string]: number;
  }>({});

  useEffect(() => {
    const buscarCotas = async () => {
      if (!ano || !mes) return;

      const anoNum = Number(ano);
      const mesNumFinal = mapMes[(mes || "").toUpperCase().trim()];
      if (!mesNumFinal) return;

      const mesNumStr = String(mesNumFinal).padStart(2, "0");

      const matriculasUnicas = Array.from(
        new Set(
          pjesescalas.map((esc) => esc.matSgp?.toString()).filter(Boolean)
        )
      );

      const cotasTemp: { [mat: string]: number } = {};

      await Promise.all(
        matriculasUnicas.map(async (mat) => {
          try {
            const res = await fetch(
              `/api/cotas/soma?matSgp=${mat}&ano=${anoNum}&mes=${mesNumStr}`,
              {
                credentials: "include",
              }
            );
            const data = await res.json();
            cotasTemp[mat] = data.quantidade || 0;
          } catch (e) {
            console.error(`Erro ao buscar cotas de ${mat}:`, e);
            cotasTemp[mat] = 0;
          }
        })
      );

      setCotasPorMatricula(cotasTemp);
    };

    if (pjesescalas.length > 0) {
      buscarCotas();
    }
  }, [pjesescalas, ano, mes]);

  // Dentro do page.tsx

  // 👉 Função utilitária separada
  async function salvarOuAtualizarEscala(dados: any): Promise<boolean> {
    const isEdit = Boolean(dados.id);

    const params = new URLSearchParams({
      ano: String(ano),
      mes: String(mesNum),
    });

    const url = isEdit
      ? `/api/pjesescala/${dados.id}?${params.toString()}`
      : `/api/pjesescala?${params.toString()}`;

    const method = isEdit ? "PUT" : "POST";

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
        alert("Erro inesperado ao salvar escala.");
        return false;
      }

      if (!res.ok) {
        alert(result?.error || "Erro ao salvar escala.");
        return false;
      }

      await carregarOperacoesDoEvento(selectedEventoId!);


      return true;
    } catch (error) {
      console.error("Erro ao salvar Escala:", error);
      alert("Erro interno ao salvar Escala.");
      return false;
    }
  }

  // SOMA AS COTAS EXECUTADAS DE CADA OPERAÇÃO
  const atualizarTotaisOperacoes = (operacaoIdAtualizada: number) => {
  setPjesoperacoes((prevOperacoes: any[]) =>
    prevOperacoes.map((op) => {
      if (op.id !== operacaoIdAtualizada) return op;

      const escalasDaOp = op.pjesescalas?.filter(
        (esc: any) => esc.statusEscala === "AUTORIZADA"
      ) || [];

      const ttCtOfExeOper = escalasDaOp
        .filter((esc) => esc.tipoSgp === "O")
        .reduce((total, esc) => total + (esc.ttCota || 0), 0);

      const ttCtPrcExeOper = escalasDaOp
        .filter((esc) => esc.tipoSgp === "P")
        .reduce((total, esc) => total + (esc.ttCota || 0), 0);

      return {
        ...op,
        ttCtOfExeOper,
        ttCtPrcExeOper,
      };
    })
  );
};


  // DELETA O REGISTRO DA TABELA ESCALAS
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;

    try {
      const res = await fetch(`/api/pjesescala/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        alert(`Erro ao excluir: ${data.error}`);
        return;
      }

      await fetchEventos();
      await fetchEscalas();
      
      atualizarTotaisOperacoes(selectedOperacaoId!);
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao excluir.");
    }
  };
  // ATUALIZA O ESTADO DAS COTAS EXECUTADAS DE CADA OPERAÇÃO
  useEffect(() => {
  if (selectedOperacaoId) {
    atualizarTotaisOperacoes(selectedOperacaoId);
  }
}, [pjesescalas, selectedOperacaoId]);



  // Dentro do componente React
const escalasFiltradasPorOperacao = useMemo(() => {
  const resultado: Record<string, any[]> = {};

  operacaoSelecionado.forEach((op) => {
    const escalas = pjesescalas.filter(
      (esc) => esc.pjesOperacaoId === op.id
    );

    const termo = busca.toLowerCase();

    resultado[op.id] = escalas
      .filter((escala) => {
        return (
          escala.nomeGuerraSgp?.toLowerCase().includes(termo) ||
          escala.nomeCompletoSgp?.toLowerCase().includes(termo) ||
          escala.pgSgp?.toLowerCase().includes(termo) ||
          escala.matSgp?.toString().includes(termo) ||
          escala.phone?.toString().includes(termo) ||
          escala.localApresentacaoSgp?.toLowerCase().includes(termo) ||
          escala.statusEscala?.toLowerCase().includes(termo) ||
          new Date(escala.dataInicio)
            .toLocaleDateString("pt-BR")
            .includes(termo)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      );
  });

  return resultado;
}, [pjesescalas, operacaoSelecionado, busca]);

const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
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

    // Atualiza dados no frontend após sucesso
    await fetchEscalas(); // ou carregarOperacoesDoEvento(selectedEventoId!)
    atualizarTotaisOperacoes(selectedOperacaoId!);
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    alert("Erro interno ao atualizar status.");
  }
};




  if (loading) return <p style={{ color: "white" }}>Carregando dados...</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontSize: "12px",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div>
        {mostrarTeto && (
          <div
            style={{
              width: "100%",
              borderBottom: "1px solid #d6d8d5",
              padding: "8px",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontSize: "15px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3>
                <strong>
                  PJES {mes} | {ano}
                </strong>
              </h3>
            </div>
            <ul
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                padding: 0,
                width: "100%",
              }}
            >
              {pjestetos.map((teto) => (
                <li
                  key={teto.id}
                  onClick={() => handleTetoClick(teto.id)}
                  style={{
                    cursor: "pointer",
                    fontWeight: selectedTetoId === teto.id ? "bold" : "normal",
                    background:
                      selectedTetoId === teto.id ? "#468d8d" : "transparent",
                    color: selectedTetoId === teto.id ? "#fff" : "#8d8888",
                    borderRadius: "25px",
                    padding: "8px",
                    listStyle: "none",
                    textAlign: "center",
                    flex: "1 1 150px",
                    minWidth: "150px",
                  }}
                >
                  <Image
                    width={50}
                    height={50}
                    src={teto.imagemUrl || "/assets/images/logo.png"}
                    alt="logo"
                    style={{
                      opacity: selectedTetoId === teto.id ? 1 : 0.8,
                      width: selectedTetoId === teto.id ? "65px" : "50px",
                      height: selectedTetoId === teto.id ? "65px" : "50px",
                      display: "block",
                      margin: "0 auto",
                      borderRadius: "50%",
                      transition: "opacity 0.3s ease-in-out",
                    }}
                  />
                  <div style={{ fontSize: "12px" }}>
                    <strong>{teto.nomeVerba}</strong>
                  </div>
                  <div style={{ fontSize: "11px" }}>
                    Of : {teto.tetoOf} | {teto.tetoOf}
                  </div>
                  <div style={{ fontSize: "11px" }}>
                    Prç: {teto.tetoPrc} | {teto.tetoPrc}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mostrarDist && (
          <div
            style={{
              width: "100%",
              padding: "8px",
              color: "#000000",
              zIndex: 5,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>
                <strong>DISTRIBUIÇÃO</strong>
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "15px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setModalData(null); // null = novo cadastro
                  setMostrarModal(true);
                }}
              >
                <FaPlus color="#000000" />
              </div>
            </div>
            <table
              className={styles["tabela-zebra"]}
              style={{
                width: "100%",
                fontSize: "11px",
                borderCollapse: "collapse",
                borderBottom: "2px solid #288b00",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#050505", color: "white" }}>
                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Diretoria
                  </th>
                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Distribuição
                  </th>

                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Oficiais (Cotas Distribuidas)
                  </th>

                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Oficiais (Cotas Executadas)
                  </th>

                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Praças (Cotas Distribuidas)
                  </th>

                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    Praças (Cotas Executadas)
                  </th>
                  <th style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                    #
                  </th>
                </tr>
              </thead>
              <tbody>
                {distSelecionado.map((dist) => (
                  <tr
                    key={dist.id}
                    onClick={() => handleDistClick(dist.id)}
                    style={{
                      cursor: "pointer",
                      background:
                        selectedDistId === dist.id ? "#dae0da" : "transparent",
                      color: selectedDistId === dist.id ? "#076b3b" : "#000000",
                      fontWeight:
                        selectedDistId === dist.id ? "bold" : "normal",
                      borderRadius: "8px",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.nomeDiretoria}
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.nomeDist}
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.ttCtOfDist} | R$ 999.999,00
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.ttCtOfDist} | R$ 999.999,00
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.ttCtPrcDist} | R$ 999.999,00
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      {dist.ttCtPrcDist} | R$ 999.999,00
                    </td>
                    <td style={{ border: "1px solid #ebe6e6", padding: "4px" }}>
                      <div
                        style={{
                          display: "flex",
                          padding: "5px",
                        }}
                      >
                        {/* botao de editar a distribuição */}
                        <div style={{ padding: "2px" }}>
                          <FaEdit
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation(); // evita clicar também na linha
                              setModalData(dist); // envia o item para o modal
                              setMostrarModal(true);
                            }}
                          />
                        </div>
                        {/* botao de excluir a distribuição */}
                        <div style={{ padding: "2px" }}>
                          <FaTrash
                            style={{ cursor: "pointer" }}
                            onClick={async (e) => {
                              e.stopPropagation(); // evita conflito com onClick da linha
                              if (
                                confirm(
                                  "Deseja realmente excluir esta distribuição?"
                                )
                              ) {
                                try {
                                  await fetch(`/api/pjesdist/${dist.id}`, {
                                    method: "DELETE",
                                  });
                                  setPjesdists((prev) =>
                                    prev.filter((d) => d.id !== dist.id)
                                  );
                                  alert("Distribuição excluída com sucesso!");
                                } catch (error) {
                                  console.error("Erro ao excluir:", error);
                                  alert("Erro ao excluir distribuição.");
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* O CONTEUDO DEVE SER COLCADO AQUI ABAIXO */}

        <div
          style={{
            width: "25%",
            padding: "5px",
            borderRight: "2px solid #000000",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              height: "40px",
              color: "white",
              fontSize: "12px",
              alignItems: "center",
              background: "#015050",
            }}
          >
            <h3>DIRETORIAS</h3>
          </div>

          {/*MODCULO DIRETORIAS*/}

          {/*INICIO DA TABELA DIM*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "30px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>DIM</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaStar /> 1000 | 1000
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaForward /> 1000 | 1000
            </div>
          </div>

          <table
            className={styles["tabela-zebra"]}
            style={{
              width: "100%",
              marginTop: "8px",
              fontSize: "11px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#015050", color: "white" }}>
                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Unidade
                </th>
                <th style={{ border: "1px solid #555", padding: "4px" }}>Of</th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Prç
                </th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>#</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> 11º BPM</td>
                <td> 100 | 100</td>
                <td> 100 | 100</td>
                <td>
                  {" "}
                  <FaCheck />
                </td>
              </tr>
            </tbody>
          </table>
          {/*FIM DA TABELA DE CONSUMO DIM*/}

          {/*INICIO DO RESUMO DIM*/}
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3
              style={{ fontSize: "15px", paddingTop: "10px", color: "#015050" }}
            >
              <strong>Planejado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Executado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Saldo:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          {/*FIM DO RESUMO DIM*/}

          {/*FIM DA TABELA DIM*/}

          {/*--------------------------------------------------------------------------------------------------------------- */}

          {/*INICIO DA TABELA DIRESP*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "30px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>DIRESP</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaStar /> 1000 | 1000
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaForward /> 1000 | 1000
            </div>
          </div>

          <table
            className={styles["tabela-zebra"]}
            style={{
              width: "100%",
              marginTop: "8px",
              fontSize: "11px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#015050", color: "white" }}>
                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Unidade
                </th>
                <th style={{ border: "1px solid #555", padding: "4px" }}>Of</th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Prç
                </th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>#</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> 11º BPM</td>
                <td> 100 | 100</td>
                <td> 100 | 100</td>
                <td>
                  {" "}
                  <FaCheck />
                </td>
              </tr>
            </tbody>
          </table>
          {/*FIM DA TABELA DE CONSUMO DIRESP*/}

          {/*INICIO DO RESUMO DIRESP*/}
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3
              style={{ fontSize: "15px", paddingTop: "10px", color: "#015050" }}
            >
              <strong>Planejado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Executado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Saldo:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          {/*FIM DO RESUMO DIRESP*/}

          {/*FIM DA TABELA DIRESP*/}

          {/*--------------------------------------------------------------------------------------------------------------- */}

          {/*INICIO DA TABELA DINTER I*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "30px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>DINTER I</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaStar /> 1000 | 1000
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaForward /> 1000 | 1000
            </div>
          </div>

          <table
            className={styles["tabela-zebra"]}
            style={{
              width: "100%",
              marginTop: "8px",
              fontSize: "11px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#015050", color: "white" }}>
                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Unidade
                </th>
                <th style={{ border: "1px solid #555", padding: "4px" }}>Of</th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Prç
                </th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>#</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> 11º BPM</td>
                <td> 100 | 100</td>
                <td> 100 | 100</td>
                <td>
                  {" "}
                  <FaCheck />
                </td>
              </tr>
            </tbody>
          </table>
          {/*FIM DA TABELA DE CONSUMO DINTER I*/}

          {/*INICIO DO RESUMO DINTER I*/}
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3
              style={{ fontSize: "15px", paddingTop: "10px", color: "#015050" }}
            >
              <strong>Planejado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Executado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Saldo:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          {/*FIM DO RESUMO DINTER I*/}

          {/*FIM DA TABELA DINTER I*/}

          {/*--------------------------------------------------------------------------------------------------------------- */}

          {/*INICIO DA TABELA DINTER II*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "30px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>DINTER II</h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaStar /> 1000 | 1000
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#9a9c9c",
                fontSize: "15px",
              }}
            >
              <FaForward /> 1000 | 1000
            </div>
          </div>

          <table
            className={styles["tabela-zebra"]}
            style={{
              width: "100%",
              marginTop: "8px",
              fontSize: "11px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#015050", color: "white" }}>
                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Unidade
                </th>
                <th style={{ border: "1px solid #555", padding: "4px" }}>Of</th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>
                  Prç
                </th>

                <th style={{ border: "1px solid #555", padding: "4px" }}>#</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> 11º BPM</td>
                <td> 100 | 100</td>
                <td> 100 | 100</td>
                <td>
                  {" "}
                  <FaCheck />
                </td>
              </tr>
            </tbody>
          </table>
          {/*FIM DA TABELA DE CONSUMO DINTER II*/}

          {/*INICIO DO RESUMO DINTER II*/}
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3
              style={{ fontSize: "15px", paddingTop: "10px", color: "#015050" }}
            >
              <strong>Planejado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Executado:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          <hr
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              borderTop: "1px solid #cecbcb",
            }}
          />

          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              marginBottom: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "30px",
            }}
          >
            <h3 style={{ fontSize: "15px", color: "#015050" }}>
              <strong>Saldo:</strong>
            </h3>
            <span style={{ fontSize: "12px", color: "#9a9c9c" }}>
              R$ 100.000,00
            </span>
          </div>
          {/*FIM DO RESUMO DINTER II*/}

          {/*FIM DA TABELA DINTER II*/}
        </div>

        {/* O CONTEUDO DEVE SER COLCADO AQUI ACIMA */}

        {mostrarEvento && (
          <div className={styles.eventoPrincipal}>
            <div className={styles.eventoTitulo}>
              <h3>EVENTOS</h3>
            </div>

            <div className={styles.eventoNomePrincipal}>
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={styles.eventoInputBuscar}
              />

              <div
                className={styles.eventoCadastrar}
                onClick={() => {
                  if (!selectedDistId) {
                    alert("Selecione uma distribuição primeiro.");
                    return;
                  }

                  setModalDataEvento({
                    pjesDistId: selectedDistId,
                    mes: mesNum,
                    ano: Number(ano),
                    userId: userId,
                    statusEvento: "AUTORIZADA",
                  });
                  setMostrarModalEvento(true);
                }}
              >
                <FaPlus color="#ff8800" />
              </div>
            </div>

            {eventoSelecionado.length === 0 ? (
              <p>Nenhum evento para esta distribuição.</p>
            ) : (
              <ul style={{ padding: "2px", height: "80px", fontSize: "12px" }}>
                {eventoSelecionado.map((evento: any) => {
                  let color = "#f7911e";
                  if (evento.statusEvento === "AUTORIZADA") color = "#ffffff";
                  else if (evento.statusEvento === "HOMOLOGADA")
                    color = "#ff0000";

                  return (
                    <li
                      key={evento.id}
                      onClick={() => handleEventoClick(evento.id)}
                      className={styles.eventoImagemLi}
                      style={{
                        fontWeight:
                          selectedEventoId === evento.id ? "bold" : "normal",
                        background:
                          selectedEventoId === evento.id
                            ? "#ffdcba"
                            : "#ffffff",
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
                            style={menuItemStyle}
                            onClick={() => handleToggleStatus(evento)}
                          >
                            {evento.statusEvento === "AUTORIZADA"
                              ? "Homologar"
                              : "Autorizar"}
                          </div>

                          <div
                            style={menuItemStyle}
                            onClick={() => handleEditarEvento(evento)}
                          >
                            Editar
                          </div>
                          <div
                            style={{ ...menuItemStyle, borderBottom: "none" }}
                            onClick={() => handleExcluirEvento(evento.id)}
                          >
                            Excluir
                          </div>
                        </div>
                      )}

                      {/* Imagem na operação*/}
                      <div className={styles.eventoImagem}>
                        <Image
                          src={getImagemPorCodVerba(evento.codVerba)}
                          alt="logo"
                          width={30}
                          height={30}
                          style={{ borderRadius: "50%" }}
                        />
                      </div>

                      {/* Texto à direita */}
                      <div style={{ flex: 1 }}>
                        <div className={styles.eventoTextoADireita}>
                          {evento.nomeOme || "Unidade"} <br></br>
                          {evento.nomeEvento}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6e6e6e" }}>
                         <span style={{ paddingRight: "20px"}}> Oficiais: {evento.ttCtOfEvento} | {evento.somaCotaOfEscala}</span>  Praças: {evento.ttCtPrcEvento} | {evento.somaCotaPrcEscala}
                        </div>
                      </div>
                      <div style={{ fontSize: "20px" }}>
                        {evento.statusEvento === "AUTORIZADA" ? (
                          <FaLockOpen color="green" />
                        ) : evento.statusEvento === "HOMOLOGADA" ? (
                          <FaLock color="red" />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {mostrarOperacao && (
          <div className={styles.operacaoPrincipal}>
            <div className={styles.operacaoTitulo}>
              <h3>OPERAÇÕES</h3>
            </div>
            <div className={styles.operacaoNomePrincipal}>
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={styles.operacaoInputBuscar}
              />

              <div
                className={styles.operacaoCadastrar}
                onClick={() => {
                  if (!selectedEventoId) {
                    alert("Selecione um Evento primeiro.");
                    return;
                  }

                  setModalDataOperacao({
                    pjesEventoId: selectedEventoId,
                    omeId: eventoSelecionadoObj?.omeId ?? "",
                    mes: mesNum,
                    ano: Number(ano),
                    userId: userId,
                    statusOperacao: "AUTORIZADA", // ou outro default
                  });
                  setMostrarModalOperacao(true);
                }}
              >
                <div>
                  <FaPlus color="#4400ff" />
                </div>
                <div
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  <FaDownload color="#1f9c00" />
                </div>
              </div>
            </div>
            <ul>
              {operacaoSelecionado.map((op) => {
                const escalaDaOperacao = pjesescalas.filter(
                  (esc) => esc.pjesOperacaoId === op.id
                );
                const isAberto = selectedOperacaoId === op.id;

                return (
                  <li key={op.id} className={styles.operacaoImagemLi}>
                    <div className={styles.operacaoImagem}>
                      <Image
                        src={getImagemPorCodVerba(op.codVerba)}
                        alt="logo"
                        width={30}
                        height={30}
                        className={styles.operacaoImagemReal}
                      />

                      <div className={styles.operacaoBotaoAddPms}>
                        <button
                          disabled={!isAberto}
                          onClick={() => {
                            setModalDataEscala({
                              pjesOperacaoId: op.id,
                              mes: mesNum,
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
                        {/* Editar operação */}
                        <button
                          disabled={!isAberto}
                          onClick={() => {
                            setModalDataOperacao(op); // 👉 Abre o modal com os dados da operação
                            setMostrarModalOperacao(true);
                          }}
                          className={styles.operacaoBotaoEditarPmsReal}
                          style={{
                            cursor: isAberto ? "pointer" : "not-allowed",
                            opacity: isAberto ? 1 : 0.3,
                            paddingLeft: "10px",
                            paddingRight: "10px",
                          }}
                        >
                          <FaEdit />
                        </button>

                        {/* Excluir operação */}
                        <button
                          disabled={!isAberto}
                          onClick={async () => {
                            const confirm = window.confirm("Tem certeza que deseja excluir esta operação?");
                            if (!confirm) return;

                            try {
                              const res = await fetch(`/api/pjesoperacao/${op.id}`, {
                                method: "DELETE",
                              });

                              if (!res.ok) {
                                const { error } = await res.json();
                                alert(error || "Erro ao excluir operação.");
                                return;
                              }

                              await fetchOperacoes(); // ✅ Recarrega após exclusão
                            } catch (error) {
                              console.error("Erro ao excluir operação:", error);
                              alert("Erro interno ao excluir operação.");
                            }
                          }}
                          className={styles.operacaoBotaoExcluirPmsReal}
                          style={{
                            cursor: isAberto ? "pointer" : "not-allowed",
                            opacity: isAberto ? 1 : 0.3,
                            paddingLeft: "10px",
                            paddingRight: "10px",
                          }}
                        >
                          <FaTrash />
                        </button>

                        <button
                          disabled={!isAberto}
                          onClick={() => {
                            setModalDataEscala({
                              pjesOperacaoId: op.id,
                              mes: mesNum,
                              ano: Number(ano),
                              userId: userId,
                              statusEscala: "AUTORIZADA",
                            });
                            setMostrarModalEscala(true);
                          }}
                          className={styles.operacaoBotaoPdfPmsReal}
                          style={{
                            cursor: isAberto ? "pointer" : "not-allowed",
                            opacity: isAberto ? 1 : 0.3,
                            paddingLeft:'10px',
                            paddingRight:'10px',
                          }}
                        >
                          <FaFilePdf />
                        </button>
                        <button
                          disabled={!isAberto}
                          onClick={() => {
                            setModalDataEscala({
                              pjesOperacaoId: op.id,
                              mes: mesNum,
                              ano: Number(ano),
                              userId: userId,
                              statusEscala: "AUTORIZADA",
                            });
                            setMostrarModalEscala(true);
                          }}
                          className={styles.operacaoBotaoBaixarPmsReal}
                          style={{
                            cursor: isAberto ? "pointer" : "not-allowed",
                            opacity: isAberto ? 1 : 0.3,
                            paddingLeft:'10px',
                            paddingRight:'10px',
                          }}
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>

                    <div className={styles.operacaoNomeTabela}>
                      <div
                        onClick={() => handleOperacaoClick(op.id)}
                        className={styles.operacaoNomeClickTabela}
                        style={{
                          fontWeight: isAberto ? "bold" : "normal",
                          background: isAberto ? "#2a6fa8" : "#7d7e80",
                        }}
                      >
                        <div style={{ flex: 2 }}>
                          {op?.nomeOme || "Unidade"} | {op.nomeOperacao}
                        </div>

                        <div className={styles.operacaoIconOfPrc}>
                          <FaStar /> {op.ttCtOfOper} | {op.ttCtOfExeOper}
                        </div>

                        <div className={styles.operacaoIconOfPrc}>
                          <FaForward /> {op.ttCtPrcOper} | {op.ttCtPrcExeOper}
                        </div>
                      </div>
                    </div>

                    {isAberto &&
                      escalaDaOperacao.length > 0 &&
                      (() => {
                        const termo = busca.toLowerCase();

                        const escalasFiltradas = escalasFiltradasPorOperacao[op.id] ?? [];

                          const totalPaginas = Math.ceil(
                            escalasFiltradas.length / escalasPorPagina
                          );
                          const escalasPaginadas = escalasFiltradas.slice(
                            (paginaAtual - 1) * escalasPorPagina,
                            paginaAtual * escalasPorPagina
                          );

                        return (
                          <div
                            style={{
                              paddingLeft: "10px",
                              paddingRight: "10px",
                            }}
                          >
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
                                <tr
                                  style={{
                                    background: "#0d5997",
                                    color: "white",
                                  }}
                                >
                                  <th className={styles.operacaoTableTh}>
                                    Identificação do Policial
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    Data e Hora do Serviço
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    Local Apresentação
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    Telefone
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    Função
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    <FaCheckSquare />
                                  </th>
                                  <th className={styles.operacaoTableTh}>
                                    Ações
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {escalasPaginadas.map((escala: any) => {
                                  const mat = escala.matSgp?.toString();

                                  return (
                                    <tr key={escala.id}>
                                      <td>
                                        {" "}
                                        {escala.pgSgp} {escala.matSgp}{" "}
                                        {escala.nomeGuerraSgp} {escala.omeSgp}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        {formatarDataISOParaBR(
                                          escala.dataInicio
                                        )}{" "}
                                        {escala.horaInicio} às{" "}
                                        {escala.horaFinal}
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "center",
                                        }}
                                      >
                                        {escala.localApresentacaoSgp}
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "center",
                                        }}
                                      >
                                        {" "}
                                        {escala.phone}
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "center",
                                        }}
                                      >
                                        {" "}
                                        {escala.funcao}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <div
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "5px",
                                            cursor: "pointer",
                                          }}
                                          title="Clique para homologar/desfazer"
                                          onClick={() => toggleStatusEscala(escala)}
                                        >
                                          {escala.statusEscala === "HOMOLOGADA" ? (
                                            <FaCheckSquare color="green" />
                                          ) : (
                                            <FaRegSquare />
                                          )}
                                        </div>
                                      </td>
                                      <td
                                        style={{
                                          textAlign: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "inline-flex", // Permite que o conteúdo seja tratado como inline
                                            alignItems: "center", // Alinha verticalmente os ícones/texto
                                            padding: "5px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              marginRight: "5px",
                                              padding: "2px",
                                              cursor: "pointer",
                                            }}
                                            onClick={() =>
                                              handleDelete(escala.id)
                                            }
                                            title="Excluir escala"
                                          >
                                            <FaTrash color="red" />
                                          </div>

                                          <div
                                            style={{
                                              marginRight: "5px",
                                              padding: "2px",
                                              cursor: "pointer",
                                            }}
                                            title="Adicionar observação"
                                            onClick={() => handleAbrirObs(escala)}
                                          >
                                            <FaComment color={escala.obs ? "#007bff" : "#888"} />
                                          </div>

                                          <div>
                                            <div>
                                              <div>
                                                ({cotasPorMatricula[mat] ?? 0})
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            <div className={styles.operacaoPaginacaoPrinciapl}>
                              <button
                                onClick={() =>
                                  setPaginaAtual((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                disabled={paginaAtual === 1}
                                className={styles.operacaoPaginacaoAnterior}
                              >
                                Anterior
                              </button>
                              <span>
                                Página {paginaAtual} de {totalPaginas}
                              </span>
                              <button
                                onClick={() =>
                                  setPaginaAtual((prev) =>
                                    Math.min(prev + 1, totalPaginas)
                                  )
                                }
                                disabled={paginaAtual === totalPaginas}
                                className={styles.operacaoPaginacaoProxima}
                              >
                                Próxima
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <DistribuicaoModal
        isOpen={mostrarModal}
        onClose={() => {
          setMostrarModal(false);
          setModalData(null);
        }}
        onSubmit={async (dados) => {
          const isEdit = Boolean(dados.id);
          const url = isEdit ? `/api/pjesdist/${dados.id}` : "/api/pjesdist";
          const method = isEdit ? "PUT" : "POST";

          try {
            const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            });

            const result = await res.json();

            if (!res.ok) {
              alert(result.error || "Erro ao salvar distribuição.");
              return; // não fecha o modal
            }

            if (isEdit) {
              setPjesdists((prev) =>
                prev.map((d) => (d.id === result.id ? result : d))
              );
            } else {
              setPjesdists((prev) => [...prev, result]);
            }

            // ✅ Fecha o modal só se deu certo
            setMostrarModal(false);
            setModalData(null);
          } catch (error) {
            console.error("Erro ao salvar distribuição:", error);
            alert("Erro interno ao salvar distribuição.");
          }
        }}
        tetos={pjestetos}
        selectedTetoId={selectedTetoId}
        mes={mesNum}
        ano={Number(ano)}
        userId={userId}
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
            mes: String(mesNum),
          });

          const url = isEdit
            ? `/api/pjesevento/${dados.id}?${params.toString()}`
            : `/api/pjesevento?${params.toString()}`;

          const method = isEdit ? "PUT" : "POST";

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
              alert("Erro inesperado ao salvar evento.");
              return false;
            }

            if (!res.ok) {
              alert(result?.error || "Erro ao salvar evento.");
              return false;
            }

            // ✅ (nova) Recarrega todos os eventos após salvar
            await fetchEventos();

            // ✅ Fecha o modal
            setMostrarModalEvento(false);
            setModalDataEvento(null);

            return true;
          } catch (error) {
            console.error("Erro ao salvar evento:", error);
            alert("Erro interno ao salvar evento.");
            return false;
          }
        }}
        mes={mesNum}
        ano={Number(ano)}
        userId={userId}
        initialData={modalDataEvento}
        dists={pjesdists}
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
            mes: String(mesNum),
          });

          const url = isEdit
            ? `/api/pjesoperacao/${dados.id}?${params.toString()}`
            : `/api/pjesoperacao?${params.toString()}`;

          const method = isEdit ? "PUT" : "POST";

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
              alert("Erro inesperado ao salvar Operacao.");
              return false;
            }

            if (!res.ok) {
              alert(result?.error || "Erro ao salvar Operacao.");
              return false;
            }

            // ✅ (nova) Recarrega todos os eventos após salvar
            await fetchOperacoes();

            // ✅ Fecha o modal
            setMostrarModalOperacao(false);
            setModalDataOperacao(null);

            return true;
          } catch (error) {
            console.error("Erro ao salvar Operacao:", error);
            alert("Erro interno ao salvar Operacao.");
            return false;
          }
        }}
        mes={mesNum}
        ano={Number(ano)}
        userId={userId}
        initialData={modalDataOperacao}
        eventos={pjeseventos}
        selectedEventoId={selectedEventoId}
      />

      <EscalaModal
        isOpen={mostrarModalEscala}
        onClose={() => {
          setMostrarModalEscala(false);
          setModalDataEscala(null);
        }}
        onSuccess={async () => {
          await fetchEscalas();
          await fetchEventos();

          const operacoesAtualizadas = await buscarOperacoes();
          setPjesoperacoes(operacoesAtualizadas);
          setMostrarModalEscala(false);
          setModalDataEscala(null);
        }}
        onSubmit={salvarOuAtualizarEscala}
        mes={mesNum}
        ano={Number(ano)}
        userId={userId}
        initialData={modalDataEscala}
        operacoes={pjesoperacoes}
        selectedOperacaoId={selectedOperacaoId}
        omeId={eventoSelecionadoObj?.omeId ?? 0}
        pjesEventoId={selectedEventoId ?? 0}
      />

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

        const res = await fetch(`/api/pjesescala/${id}/obs`, {
          method: "PATCH", // ou "PUT", tanto faz, pois a route.ts está preparada
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

        await fetchEscalas();
        setMostrarModalObs(false);
        setModalDataObs(null);
        return true;
      } catch (error) {
        console.error("Erro ao salvar observação:", error);
        alert("Erro interno ao salvar observação.");
        return false;
      }
    }}


/>



    </div>
  );
}
