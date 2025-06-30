"use client";
import { useState, useEffect } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";

type Ome = {
  id: number;
  nomeOme: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => void;
  eventos: any[];
  selectedEventoId: number | null;
  mes: number;
  ano: number;
  userId: number;
  initialData?: any;
};

export default function OperacaoModal({
  isOpen,
  onClose,
  onSubmit,
  eventos,
  selectedEventoId,
  mes,
  ano,
  userId,
  initialData,
}: Props) {
  const [ome, setOme] = useState<Ome[]>([]);

  const [form, setForm] = useState({
    nomeOperacao: "",
    omeId: "",
    ttCtOfOper: "",
    ttCtPrcOper: "",
  });

  // Buscar Omes
  useEffect(() => {
    const fetchOme = async () => {
      const res = await fetch("/api/ome");
      const data = await res.json();
      setOme(data);
    };
    fetchOme();
  }, []);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (initialData) {
      setForm({
        nomeOperacao: initialData.nomeOperacao || "",
        omeId: String(initialData.omeId || ""),
        ttCtOfOper: String(initialData.ttCtOfOper || ""),
        ttCtPrcOper: String(initialData.ttCtPrcOper || ""),
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!initialData?.id && !selectedEventoId) {
      alert("Selecione uma evento antes de salvar.");
      return;
    }

    const dados = {
      ...(initialData?.id && { id: initialData.id }),
      nomeOperacao: form.nomeOperacao,
      omeId: Number(form.omeId),
      ttCtOfOper: Number(form.ttCtOfOper),
      ttCtPrcOper: Number(form.ttCtPrcOper),
      statusOperacao: initialData?.statusOperacao || "AUTORIZADA",
      mes,
      ano,
      userId,
      pjesEventoId: initialData?.pjesEventoId || selectedEventoId,
    };

    const sucesso = await onSubmit(dados);

    if (sucesso) {
      onClose(); // ✅ Apenas fecha o modal — atualização fica com o componente-pai
    }
  };

  return (
    isOpen && (
      <div className={styles.modalOverlayDist} onClick={onClose}>
        <div className={styles.distModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalRightDist}>
            <h3 style={{ fontSize: "15px", paddingBottom: "10px" }}>
              <strong>
                {initialData ? "Cadastrar" : "Cadastrar"} Operacao
              </strong>
            </h3>

            <div
              className={styles.inputGroup}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                className={styles.input}
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  color: "#333",
                }}
              >
                {ome.find((d) => d.id === Number(form.omeId))?.nomeOme ||
                  "Unidade não encontrada"}
              </div>

              <input
                className={styles.input}
                name="nomeOperacao"
                placeholder="Nome da Operacao"
                onChange={handleChange}
                value={form.nomeOperacao}
              />

              <div
                style={{
                  display: "flex",
                }}
              >
                <input
                  className={styles.input}
                  name="ttCtOfOper"
                  placeholder="Total Oficiais"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtOfOper}
                  style={{ marginRight: "10px" }}
                />

                <input
                  className={styles.input}
                  name="ttCtPrcOper"
                  placeholder="Total Praças"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtPrcOper}
                />
              </div>
            </div>

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
    )
  );
}
