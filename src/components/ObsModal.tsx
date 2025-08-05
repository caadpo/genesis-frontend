import { useEffect, useState } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";
import {
  FaCalendar,
  FaCheckSquare,
  FaComment,
  FaPhone,
  FaRegSquare,
  FaUser,
} from "react-icons/fa";

type Comentario = {
  id: number;
  comentario: string;
  createdAt: string;
  autor: {
    id: number; // ✅ Adicionado
    nomeGuerra: string;
    pg: string;
    ome?: { nomeOme: string };
  };
};


type UsuarioParcial = {
  pg?: string;
  nomeGuerra: string;
  nomeOme: string;
  imagemUrl?: string;
};


type InitialDataObs = {
  id?: number;
  userObs?: UsuarioParcial;
  [key: string]: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => Promise<boolean>;
  initialData?: InitialDataObs | null;
};


export default function ObsModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState({ observacao: "" });
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔁 Carrega comentários ao abrir a modal
  useEffect(() => {
    if (!initialData?.id) return; // Garante que initialData e id existem
  
    const carregarComentarios = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pjesescala/${initialData.id}/comentario`);
        const data = await res.json();
        if (res.ok) {
          setComentarios(data);
        } else {
          console.error("Erro ao buscar comentários:", data.error);
        }
      } catch (error) {
        console.error("Erro ao carregar comentários:", error);
      } finally {
        setLoading(false);
      }
    };
  
    carregarComentarios();
  }, [initialData]);
  
  

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!initialData?.id) return; // Garante que initialData.id existe
  
    const dados = {
      id: initialData.id,
      escalaId: initialData.id,
      obs: form.observacao,
    };
  
    const sucesso = await onSubmit(dados);
  
    if (sucesso) {
      setForm({ observacao: "" });
  
      // Recarrega comentários com segurança
      const res = await fetch(`/api/pjesescala/${initialData.id}/comentario`);
      const data = await res.json();
      if (res.ok) {
        setComentarios(data);
      }
    }
  };
  

  const formatarDataParaDiaMes = (dataStr: string) => {
    const data = getDataLocal(dataStr); // <- isso evita o erro de fuso
    return data
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      .slice(0, 5);
  };
  const getDataLocal = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  };

  if (!isOpen || !initialData) return null;

  return (
    <div className={styles.modalOverlayObs} onClick={onClose}>
      <div className={styles.obsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalRightDist}>
          {/* INICIO RESUMO DAS INFO BASICAS DO USUARIO DENTRO DO COMENTARIO*/}
          <div style={{ display: "flex", width: "100%" }}>
            <FaUser className={styles.usuarioSemImagem} />
            <div className={styles.usuarioInfo}>
              <span className={styles.usuarioNome}>
                {initialData.pgSgp} {initialData.matSgp}{" "}
                {initialData.nomeGuerraSgp} {initialData.omeSgp}
                <span style={{ paddingLeft: "20px" }}>
                  | {initialData.funcao}
                </span>
              </span>
              <div className={styles.usuarioLinha}>
                <div style={{ display: "flex" }}>
                  <FaCalendar className={styles.iconUsuarioList} />
                  <span className={styles.usuarioFuncao}>
                    {formatarDataParaDiaMes(initialData.dataInicio)}{" "}
                    <span
                      style={{
                        marginLeft: "10px",
                        marginRight: "10px",
                      }}
                    >
                      {initialData.horaInicio.slice(0, 5)} às{" "}
                      {initialData.horaFinal.slice(0, 5)}
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex" }}>
                  <FaPhone className={styles.iconUsuarioList} />
                  <span className={styles.usuarioFuncao}>
                    {initialData.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.alinharDireita}>
              <div className={styles.commentContainer}>
                {initialData.statusEscala === "HOMOLOGADA" ? (
                  <FaCheckSquare
                    style={{ color: "#1b9c2d", fontSize: "25px" }}
                  />
                ) : (
                  <FaRegSquare style={{ color: "#968f8f", fontSize: "16px" }} />
                )}
              </div>
            </div>
          </div>
          {/* FIM RESUMO DAS INFO BASICAS DO USUARIO DENTRO DO COMENTARIO*/}

          <h3
            style={{
              fontSize: "15px",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            <strong>Observação da Escala</strong>
          </h3>

          {/* Lista de comentários */}
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              marginBottom: "10px",
            }}
          >
            {loading ? (
              <p>Carregando comentários...</p>
            ) : comentarios.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                Nenhum comentário ainda.
              </p>
            ) : (
              comentarios.map((c) => (
                <div
                  key={c.id}
                  style={{
                    marginBottom: "10px",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "5px",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                    {c.autor.pg} {c.autor.nomeGuerra} —{" "}
                    <span style={{ color: "#999" }}>
                      {new Date(c.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    {/* Botão excluir (só se for o autor, ou tipo 'O', ou omeId 1) */}
                    {(initialData?.userObs as any)?.id === c.autor.id ||
                    (initialData?.userObs as any)?.tipo === "O" ||
                    (initialData?.userObs as any)?.omeId === 1 ? (
                      <button
                        onClick={async () => {
                          const confirm = window.confirm(
                            "Deseja remover este comentário?"
                          );
                          if (!confirm) return;

                          try {
                            const res = await fetch(
                              `/api/pjesescala/comentario/${c.id}`,
                              {
                                method: "DELETE",
                              }
                            );
                            const data = await res.json();
                            if (res.ok) {
                              setComentarios((prev) =>
                                prev.filter((coment) => coment.id !== c.id)
                              );
                            } else {
                              alert(data.error || "Erro ao remover.");
                            }
                          } catch (error) {
                            console.error("Erro ao excluir:", error);
                            alert("Erro ao remover comentário.");
                          }
                        }}
                        style={{
                          marginLeft: "10px",
                          fontSize: "12px",
                          background: "none",
                          border: "none",
                          color: "red",
                          cursor: "pointer",
                        }}
                        title="Excluir comentário"
                      >
                        ✖
                      </button>
                    ) : null}
                  </div>
                  <div style={{ fontSize: "14px" }}>{c.comentario}</div>
                </div>
              ))
            )}
          </div>

          {/* Campo de novo comentário */}
          <div className={styles.inputGroup}>
            <textarea
              name="observacao"
              className={styles.input}
              rows={2}
              placeholder="Digite a observação..."
              value={form.observacao}
              onChange={handleChange}
            />
          </div>

          {/* Botões */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className={styles.closeModal}
              onClick={handleSubmit}
              style={{ width: "100px", backgroundColor: "#118a2f" }}
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
  );
}
