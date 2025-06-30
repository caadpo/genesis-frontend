"use client";
import { useState, useEffect } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";

type Diretoria = {
  id: number;
  nomeDiretoria: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => void;
  tetos: any[];
  selectedTetoId: number | null;
  mes: number;
  ano: number;
  userId: number;
  initialData?: any;
};

export default function DistribuicaoModal({
  isOpen,
  onClose,
  onSubmit,
  tetos,
  selectedTetoId,
  mes,
  ano,
  userId,
  initialData,
}: Props) {
  const [diretoria, setDiretoria] = useState<Diretoria[]>([]);

  const [form, setForm] = useState({
    nomeDist: "",
    diretoriaId: "",
    ttCtOfDist: "",
    ttCtPrcDist: "",
  });

  // Buscar diretorias
  useEffect(() => {
    const fetchDiretoria = async () => {
      const res = await fetch("/api/diretoria");
      const data = await res.json();
      setDiretoria(data);
    };
    fetchDiretoria();
  }, []);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (initialData) {
      setForm({
        nomeDist: initialData.nomeDist || "",
        diretoriaId: String(initialData.diretoriaId || ""),
        ttCtOfDist: String(initialData.ttCtOfDist || ""),
        ttCtPrcDist: String(initialData.ttCtPrcDist || ""),
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

  const handleSubmit = () => {
    if (!selectedTetoId) {
      alert("Selecione um teto antes de salvar.");
      return;
    }

    const dados = {
      ...(initialData?.id && { id: initialData.id }), // inclui o ID só se estiver editando
      nomeDist: form.nomeDist,
      diretoriaId: Number(form.diretoriaId),
      ttCtOfDist: Number(form.ttCtOfDist),
      ttCtPrcDist: Number(form.ttCtPrcDist),
      statusDist: initialData?.statusDist || "AUTORIZADA",
      mes,
      ano,
      userId,
      pjesTetoId: selectedTetoId, // <- CORRETO AQUI
    };

    onSubmit(dados);
    onClose();
  };

  return (
    isOpen && (
      <div className={styles.modalOverlayDist} onClick={onClose}>
        <div className={styles.distModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalRightDist}>
            <h3 style={{ fontSize: "15px", paddingBottom: "10px" }}>
              <strong>{initialData ? "Editar" : "Nova"} Distribuição</strong>
            </h3>

            <div
              className={styles.inputGroup}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <select
                className={styles.input}
                name="diretoriaId"
                onChange={handleChange}
                value={form.diretoriaId}
              >
                <option value="">Gestora das Cotas</option>
                {diretoria.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nomeDiretoria}
                  </option>
                ))}
              </select>

              <input
                className={styles.input}
                name="nomeDist"
                placeholder="Defina um nome. (Ex: Decreto) "
                onChange={handleChange}
                value={form.nomeDist}
              />

              <div
                style={{
                  display: "flex",
                }}
              >
                <input
                  className={styles.input}
                  name="ttCtOfDist"
                  placeholder="Total Oficiais"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtOfDist}
                  style={{ marginRight: "10px" }}
                />

                <input
                  className={styles.input}
                  name="ttCtPrcDist"
                  placeholder="Total Praças"
                  type="number"
                  onChange={handleChange}
                  value={form.ttCtPrcDist}
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
