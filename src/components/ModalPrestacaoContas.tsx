// components/PrestacaoContasModal.tsx
import React, { useState } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (situacao: "REGULAR" | "ATRASADO") => void;
};

export default function PrestacaoContasModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [situacao, setSituacao] = useState<"REGULAR" | "ATRASADO" | "">("");

  if (!isOpen) return null;

  const handleSelect = (valor: "REGULAR" | "ATRASADO") => {
    setSituacao(valor);
  };

  return (
    <div className={styles.modalOverlayPrestarConta}>
      <div className={styles.prestarContaModal}>
        <div className={styles.modalRightPrestarConta}>
          <h2
            style={{
              fontSize: "20px",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            PRESTAÇÃO DE CONTAS | PJES
          </h2>

          <div className={styles.checkboxWrapper}>
            <div className={styles.checkboxItem}>
              <label
                className={`${styles.checkboxLabel} ${
                  situacao === "REGULAR" ? styles.regularSelected : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={situacao === "REGULAR"}
                  onChange={() => handleSelect("REGULAR")}
                />
                REGULAR
              </label>
            </div>

            <div className={styles.checkboxDivider}></div>

            <div className={styles.checkboxItem}>
              <label
                className={`${styles.checkboxLabel} ${
                  situacao === "ATRASADO" ? styles.atrasadoSelected : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={situacao === "ATRASADO"}
                  onChange={() => handleSelect("ATRASADO")}
                />
                ATRASADO
              </label>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.modalButtonConfirmar}
              onClick={() => situacao && onSubmit(situacao)}
              disabled={!situacao}
            >
              Baixar Excel
            </button>
            <button onClick={onClose} className={styles.modalButtonCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
