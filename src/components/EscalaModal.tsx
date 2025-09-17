"use client";
import { useState, useEffect } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";
import { FaUser } from "react-icons/fa";

type Ome = {
  id: number;
  nomeOme: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => Promise<boolean>;
  onSuccess?: () => void;
  operacoes: any[];
  selectedOperacaoId: number | null;
  mes: number;
  ano: number;
  userId: number;
  omeId: number;
  pjesEventoId: number;
  initialData?: any;
};

export default function EscalaModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  operacoes,
  selectedOperacaoId,
  mes,
  ano,
  userId,
  omeId,
  pjesEventoId,
  initialData,
}: Props) {
  const [ome, setOme] = useState<Ome[]>([]);

  const operacaoSelecionada = operacoes?.find(
    (op) => op.id === selectedOperacaoId
  );

  const [form, setForm] = useState({
    omeId: "",
    pgSgp: "",
    matSgp: "",
    nomeGuerraSgp: "",
    nomeCompletoSgp: "",
    omeSgp: "",
    tipoSgp: "",
    nunfuncSgp: "",
    nunvincSgp: "",
    situacaoSgp: "",
    dataInicio: "",
    dataFinal: "",
    horaInicio: "",
    horaFinal: "",
    phone: "",
    localApresentacaoSgp: "",
    funcao: "",
    anotacaoEscala: "",
    statusEscala: "AUTORIZADA",
  });

  // 🔍 BUSCAR DADOS DO SGP PELA MATRÍCULA
  const fetchDadosSgp = async (matricula: string) => {
    try {
      const res = await fetch(
        `/api/dadossgp?matricula=${matricula}&mes=${mes}&ano=${ano}`
      );

      if (!res.ok) {
        console.warn("Erro ao buscar dados do SGP");
        return;
      }
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        pgSgp: data.pgSgp || "",
        nomeGuerraSgp: data.nomeGuerraSgp || "",
        nomeCompletoSgp: data.nomeCompletoSgp || "",
        omeSgp: data.omeSgp || "",
        tipoSgp: data.tipoSgp || "",
        nunfuncSgp: data.nunfuncSgp ? String(data.nunfuncSgp) : "",
        nunvincSgp: data.nunvincSgp ? String(data.nunvincSgp) : "",
        localApresentacaoSgp: data.localApresentacaoSgp || "",
        situacaoSgp: data.situacaoSgp || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar dados do SGP:", error);
    }
  };
  const [funcaoSelecionada, setFuncaoSelecionada] = useState("");

  // 🔁 DEMAIS HOOKS E FUNÇÕES (SEM ALTERAÇÃO)
  useEffect(() => {
    const fetchOme = async () => {
      const res = await fetch("/api/ome");
      const data = await res.json();
      setOme(data);
    };
    fetchOme();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        omeId: String(omeId),
        pgSgp: String(initialData.pgSgp || ""),
        matSgp: String(initialData.matSgp || ""),
        nomeGuerraSgp: initialData.nomeGuerraSgp || "",
        nomeCompletoSgp: initialData.nomeCompletoSgp || "",
        omeSgp: String(initialData.omeSgp || ""),
        tipoSgp: String(initialData.tipoSgp || ""),
        nunfuncSgp: String(initialData.nunfuncSgp || ""),
        nunvincSgp: String(initialData.nunvincSgp || ""),
        situacaoSgp: String(initialData.situacaoSgp || ""),
        dataInicio: prev.dataInicio || String(initialData.dataInicio || ""),
        dataFinal: String(initialData.dataFinal || ""),
        horaInicio: prev.horaInicio || String(initialData.horaInicio || ""),
        horaFinal: prev.horaFinal || String(initialData.horaFinal || ""),
        phone: String(initialData.phone || ""),
        localApresentacaoSgp: String(initialData.localApresentacaoSgp || ""),
        funcao: prev.funcao || String(initialData.funcao || ""),
        anotacaoEscala: String(initialData.anotacaoEscala || ""),
        statusEscala: initialData.statusEscala || "AUTORIZADA",
      }));

      // manter o estado da função selecionada
      if (initialData.funcao) {
        setFuncaoSelecionada(initialData.funcao);
      }
    }
  }, [initialData, omeId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "matSgp") {
      const somenteNumeros = value.replace(/\D/g, "").slice(0, 7);

      setForm((prev) => ({
        ...prev,
        matSgp: somenteNumeros,
      }));

      if (somenteNumeros.length === 7) {
        fetchDadosSgp(somenteNumeros);
      } else {
        // Limpar explicitamente os campos com novo setForm FORA do anterior
        setForm((prev) => ({
          ...prev,
          pgSgp: "",
          nomeGuerraSgp: "",
          nomeCompletoSgp: "",
          omeSgp: "",
          tipoSgp: "",
          nunfuncSgp: "",
          nunvincSgp: "",
          localApresentacaoSgp: "",
          situacaoSgp: "",
        }));
      }

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!initialData?.id && !selectedOperacaoId) {
      alert("Selecione uma Operação antes de salvar.");
      return;
    }

    // Validação mínima
    if (
      !form.matSgp ||
      !form.pgSgp ||
      !form.horaInicio ||
      !form.horaFinal ||
      !form.dataInicio
    ) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const dados = {
      ...(initialData?.id && { id: initialData.id }),

      omeId: Number(form.omeId) || omeId,
      pjesOperacaoId: selectedOperacaoId || initialData?.pjesOperacaoId,
      pjesEventoId,

      pgSgp: form.pgSgp,
      matSgp: Number(form.matSgp),
      nomeGuerraSgp: form.nomeGuerraSgp,

      funcao: funcaoSelecionada,

      nomeCompletoSgp: form.nomeCompletoSgp || "Nome Completo",
      omeSgp: form.omeSgp || "OME Placeholder", // mock
      tipoSgp: form.tipoSgp || "P",
      nunfuncSgp: Number(form.nunfuncSgp) || 111111,
      nunvincSgp: Number(form.nunvincSgp) || 222222,
      situacaoSgp: form.situacaoSgp || "ATIVO",

      dataInicio: form.dataInicio.split("T")[0],
      dataFinal: (form.dataFinal || form.dataInicio).split("T")[0],
      horaInicio: form.horaInicio?.slice(0, 5),
      horaFinal: form.horaFinal?.slice(0, 5),


      phone: form.phone,
      localApresentacaoSgp: form.localApresentacaoSgp,
      anotacaoEscala: form.anotacaoEscala,
      statusEscala: form.statusEscala,

      userId,
    };

    if (initialData?.pjesOperacaoId && selectedOperacaoId && initialData.pjesOperacaoId !== selectedOperacaoId) {
      alert("Você não pode alterar a operação de uma escala existente.");
      return;
    }
    
    const sucesso = await onSubmit(dados);
    if (sucesso) {
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    }
  };

  /* INICIO METODO PARA BUSCAR A QUANTIDADE DE COTAS COM AS DATAS E NOME DA OME */
  const [cotas, setCotas] = useState<
    { dia: string; nomeOme: string; ttCota: number }[]
  >([]);

  useEffect(() => {
    if (form.matSgp && mes && ano) {
      fetch(`/api/cotas?matSgp=${form.matSgp}&ano=${ano}&mes=${mes}`)
        .then((res) => res.json())
        .then((data) => {
          setCotas(data);
        })
        .catch((err) => console.error("Erro ao buscar cotas:", err));
    }
  }, [form.matSgp, mes, ano]);

  function formatarDataISOParaDiaMes(iso: string) {
    if (!iso || !iso.includes("-")) return iso;
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}`;
  }

  /* FIM METODO PARA BUSCAR A QUANTIDADE DE COTAS COM AS DATAS E NOME DA OME */
  

  {
    /* INICIO MANTER ALGUNS DADOS JA PREENCHIDOS APOS SALVAR */
  }
  useEffect(() => {
    if (!isOpen) {
      setForm((prev) => ({
        ...prev,
        omeId: "",
        pgSgp: "",
        matSgp: "",
        nomeGuerraSgp: "",
        nomeCompletoSgp: "",
        omeSgp: "",
        tipoSgp: "",
        nunfuncSgp: "",
        nunvincSgp: "",
        situacaoSgp: "",
        phone: "",
        localApresentacaoSgp: "",
        dataInicio: prev.dataInicio,
        horaInicio: prev.horaInicio,
        horaFinal: prev.horaFinal,
        statusEscala: "AUTORIZADA",
        funcao: prev.funcao,
        anotacaoEscala: prev.anotacaoEscala,
      }));
      // MANTER a função selecionada
      setFuncaoSelecionada((prev) => prev);

      setCotas([]);
    }
  }, [isOpen]);

  {
    /* FIM MANTER ALGUNS DADOS JA PREENCHIDOS APOS SALVAR */
  }

  return (
    isOpen && (
      <div className={styles.modalOverlayEscala} onClick={onClose}>
        <div
          className={styles.escalaModal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalRightEscala}>
            <h3 style={{ fontSize: "15px", paddingBottom: "10px" }}>
              <strong>
                {initialData ? "ESCALA" : "ESCALA"} |
                {operacaoSelecionada?.nomeOperacao
                  ? ` ${operacaoSelecionada.nomeOperacao}`
                  : ""}
              </strong>
            </h3>

            <div
              className={styles.inputGroup}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1, marginBottom: "5px" }}>
                  <label>Matrícula</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="matSgp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.matSgp}
                    onChange={handleChange}
                    style={{ width: "100%" }}
                    maxLength={7}
                  />
                </div>

                <div style={{ flex: 1, marginBottom: "5px" }}>
                  <label>Telefone</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* INICIO INFORMAÇOES BASICAS DO USUARIO */}
              <div>
                <ul style={{ padding: "2px", fontSize: "12px" }}>
                  <li
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      border: "1px solid #c2bfbf",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        gap: "5px",
                        cursor: "pointer",
                        padding: "5px",
                      }}
                    >
                      {/* LADO ESQUERDO */}
                      <div
                        style={{
                          flex: 1,
                          width: "300px",
                        }}
                      >
                        {/* Imagem do usuario*/}
                        <div
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            color: "#000000",
                          }}
                        >
                          <FaUser
                            style={{ paddingBottom: "5px", fontSize: "40px" }}
                            className={styles.icon}
                          />
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {form.pgSgp} {form.matSgp} {form.nomeGuerraSgp}{" "}
                          {form.omeSgp}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          {form.nomeCompletoSgp}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          NUNFUNC: {form.nunfuncSgp}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          NUNVINC: {form.nunvincSgp}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                          SITUAÇÃO: {form.situacaoSgp}
                        </div>

                        <div style={{ fontSize: "12px" }}>
                          TOTAL DE COTAS:{" "}
                          {cotas.reduce(
                            (total, cota) => total + cota.ttCota,
                            0
                          )}
                        </div>
                      </div>

                      {/* inicio LADO DIREITO */}
                      <div
                        style={{
                          width: "100%", // Ocupa toda a largura
                          flex: 1,
                          display: "flex", // Coloca os filhos lado a lado
                          gap: "10px", // Espaço entre eles (opcional)
                        }}
                      >
                        {/* FILHA 1 */}
                        <div style={{ flex: 1 }}>
                          <table
                            className={styles["tabela-zebra"]}
                            style={{
                              width: "100%",
                              fontSize: "10px",
                              color: "#000000",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  background: "#b1ceb0",
                                  color: "white",
                                }}
                              >
                                <th
                                  style={{
                                    border: "1px solid #ebe6e6",
                                    padding: "4px",
                                  }}
                                >
                                  PJES
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {cotas.map((cota, index) => (
                                <tr key={index}>
                                  <td>
                                    {formatarDataISOParaDiaMes(cota.dia)} |{" "}
                                    {cota.nomeOme}{" "}
                                    {cota.ttCota === 2 && (
                                      <span
                                        style={{
                                          color: "blue",
                                        }}
                                      >
                                        (24h)
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* FILHA 2 */}
                        <div style={{ flex: 1 }}>
                          <table
                            className={styles["tabela-zebra"]}
                            style={{
                              width: "100%",
                              fontSize: "10px",
                              color: "#000000",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  background: "#b0b4ce",
                                  color: "white",
                                }}
                              >
                                <th
                                  style={{
                                    border: "1px solid #ebe6e6",
                                    padding: "4px",
                                  }}
                                >
                                  DIARIAS
                                </th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                      </div>

                      {/* fim LADO DIREITO */}
                    </div>
                  </li>
                </ul>
              </div>
              {/* FIM INFORMA~ÇOES BASICAS DO USUARIO */}

              {/* INICIO DATA HORA INICIAL E HORA FINAL*/}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  paddingTop: "10px",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label>Data Início</label>
                  <input
                    className={styles.input}
                    type="date"
                    name="dataInicio"
                    value={form.dataInicio?.split("T")[0] || ""}
                    onChange={handleChange}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Hora Início</label>
                  <input
                    className={styles.input}
                    type="time"
                    name="horaInicio"
                    value={form.horaInicio}
                    onChange={handleChange}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Hora Final</label>
                  <input
                    className={styles.input}
                    type="time"
                    name="horaFinal"
                    value={form.horaFinal}
                    onChange={handleChange}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* FIM DATA HORA INICIAL E HORA FINAL*/}

              {/* INICIO LOCAL DE APRESENTAÇÃO*/}

              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <label>Local de Apresentação</label>
                <input
                  className={styles.input}
                  type="text"
                  name="localApresentacaoSgp"
                  value={form.localApresentacaoSgp}
                  onChange={handleChange}
                  maxLength={50}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {form.localApresentacaoSgp.length}/50 caracteres
                </div>
              </div>

              {/* FIM LOCAL DE APRESENTAÇÃO*/}

              {/* INICIO FUNÇÃO */}
              <div>
                <ul style={{ padding: "1px", fontSize: "9px", margin: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      border: "1px solid #d3cdcd",
                      paddingTop: "10px",
                      margin: 0,
                      listStyle: "none",
                    }}
                  >
                    {[
                      "POG",
                      "CMT",
                      "MOT",
                      "PAT",
                      "MO",
                      "FISCAL",
                      "CMT GD",
                      "SENT",
                      "AUX",
                      "OUTRO",
                    ].map((label) => (
                      <label
                        key={label}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          fontSize: "9px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={funcaoSelecionada === label}
                          onChange={() =>
                            setFuncaoSelecionada((prev) =>
                              prev === label ? "" : label
                            )
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "#118a2f", // cor opcional
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </li>
                </ul>
              </div>
              {/* FIM FUNÇÃO */}

              {/* ANOTAÇÃO DA ESCALA*/}

              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <label>Anotação da Escala (Ex: Vtr, O.S, etc...)</label>
                <input
                  className={styles.input}
                  type="text"
                  name="anotacaoEscala"
                  value={form.anotacaoEscala}
                  onChange={handleChange}
                  maxLength={30}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {form.anotacaoEscala.length}/30 caracteres
                </div>
              </div>

              {/* ANOTAÇÃO DA ESCALA*/}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className={styles.closeModal}
                  onClick={handleSubmit}
                  style={{
                    width: "100px",
                    backgroundColor: "#118a2f",
                  }}
                >
                  Salvar
                </button>
                <button
                  onClick={onClose}
                  className={styles.closeModal}
                  style={{
                    width: "100px",
                    marginLeft: "10px",
                    backgroundColor: "#888",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
