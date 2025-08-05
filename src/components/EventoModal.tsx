"use client";
import { useState, useEffect } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";
import { useUser } from "@/app/context/UserContext";

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
  const user = useUser();
  const typeUser = user?.typeUser;

  const [form, setForm] = useState({
    nomeEvento: "",
    omeId: "",
    ttCtOfEvento: "",
    ttCtPrcEvento: "",
    regularOuAtrasado: "",
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
        regularOuAtrasado: String(initialData.regularOuAtrasado || "REGULAR"),
      });
    } else {
      setForm((prev) => ({
        ...prev,
        regularOuAtrasado: "REGULAR",
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLetrasMaiusculas = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value.toUpperCase(),
    });
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
      regularOuAtrasado: form.regularOuAtrasado,
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

              <div>
                <input
                  className={styles.input}
                  name="nomeEvento"
                  placeholder="Nome do Evento"
                  onChange={handleLetrasMaiusculas}
                  value={form.nomeEvento}
                  maxLength={30}
                />
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {form.nomeEvento.length}/30 caracteres
                </div>
              </div>

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

              <div
                style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <input
                    type="radio"
                    name="regularOuAtrasado"
                    value="REGULAR"
                    checked={form.regularOuAtrasado === "REGULAR"}
                    onChange={handleChange}
                    disabled={typeUser !== 5 && typeUser !== 10}
                  />
                  <span
                    style={{
                      color:
                        typeUser !== 5 && typeUser !== 10 ? "#888" : "#000",
                      fontWeight: "bold",
                    }}
                  >
                    REGULAR
                  </span>
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <input
                    type="radio"
                    name="regularOuAtrasado"
                    value="ATRASADO"
                    checked={form.regularOuAtrasado === "ATRASADO"}
                    onChange={handleChange}
                    disabled={typeUser !== 5 && typeUser !== 10}
                  />
                  <span
                    style={{
                      color:
                        typeUser !== 5 && typeUser !== 10 ? "#888" : "#000",
                      fontWeight: "bold",
                    }}
                  >
                    ATRASADO
                  </span>
                </label>
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
