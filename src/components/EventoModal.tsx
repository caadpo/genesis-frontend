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
  dists: any[];
  selectedDistId: number | null;
  mes: number;
  ano: number;
  userId: number;
  initialData?: any;
};

export default function EventoModal({
  isOpen,
  onClose,
  onSubmit,
  dists,
  selectedDistId,
  mes,
  ano,
  userId,
  initialData,
}: Props) {
  const [ome, setOme] = useState<Ome[]>([]);

  const [form, setForm] = useState({
    nomeEvento: "",
    omeId: "",
    ttCtOfEvento: "",
    ttCtPrcEvento: "",
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
        nomeEvento: initialData.nomeEvento || "",
        omeId: String(initialData.omeId || ""),
        ttCtOfEvento: String(initialData.ttCtOfEvento || ""),
        ttCtPrcEvento: String(initialData.ttCtPrcEvento || ""),
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
    if (!initialData?.id && !selectedDistId) {
      alert("Selecione uma distribuição antes de salvar.");
      return;
    }

    const dados = {
      ...(initialData?.id && { id: initialData.id }),
      nomeEvento: form.nomeEvento,
      omeId: Number(form.omeId),
      ttCtOfEvento: Number(form.ttCtOfEvento),
      ttCtPrcEvento: Number(form.ttCtPrcEvento),
      statusEvento: initialData?.statusEvento || "AUTORIZADA",
      mes,
      ano,
      userId,
      pjesDistId: initialData?.pjesDistId || selectedDistId,
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
              <strong>{initialData ? "Cadastrar" : "Cadastrar"} Evento</strong>
            </h3>

            <div
              className={styles.inputGroup}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <select
                className={styles.input}
                name="omeId"
                onChange={handleChange}
                value={form.omeId}
              >
                <option value="">Escolha a Ome</option>
                {ome.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nomeOme}
                  </option>
                ))}
              </select>

              <input
                className={styles.input}
                name="nomeEvento"
                placeholder="Nome do Evento"
                onChange={handleChange}
                value={form.nomeEvento}
              />

              <div
                style={{
                  display: "flex",
                }}
              >
                <input
                  className={styles.input}
                  name="ttCtOfEvento"
                  placeholder="Total Oficiais"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtOfEvento}
                  style={{ marginRight: "10px" }}
                />

                <input
                  className={styles.input}
                  name="ttCtPrcEvento"
                  placeholder="Total Praças"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtPrcEvento}
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
