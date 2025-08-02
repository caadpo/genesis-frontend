"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import styles from "../privateLayout.module.css";
import Image from "next/image";
import {
  FaAt,
  FaCheck,
  FaEdit,
  FaKey,
  FaPhone,
  FaPlus,
  FaTrash,
  FaUniversity,
  FaUser,
} from "react-icons/fa";
import CadastrarUsuarioModal from "@/components/CadastrarUsuarioModal";
import EditarUsuarioModal from "@/components/EditarUsuarioModal";

export default function UsuariosPage() {
  const userLogado = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditando, setIsEditando] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/user", {
          method: "GET",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro desconhecido");

        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const podeAdicionarUsuario =
    typeof userLogado?.typeUser === "number" &&
    [1, 5, 10].includes(userLogado.typeUser);

  const podeEditarOuExcluir = (usuario: any): boolean => {
    if (typeof userLogado?.typeUser === "number") {
      if ([5, 10].includes(userLogado.typeUser)) return true;
      if (userLogado.typeUser === 1) return usuario.omeId === userLogado.omeId;
    }
    return false;
  };

  const filteredUsers = users.filter((user) => {
    const termo = searchTerm.toLowerCase();

    return (
      user.mat.toString().includes(termo) ||
      user.loginSei?.toLowerCase().includes(termo) ||
      user.nomeGuerra?.toLowerCase().includes(termo) ||
      user.ome?.nomeOme?.toLowerCase().includes(termo)
    );
  });

  function abrirCadastro() {
    setIsEditando(false);
    setModalData(null);
    setMostrarModal(true);
  }

  function abrirEdicao(userData: any) {
    setIsEditando(true);
    setModalData(userData);
    setMostrarModal(true);
  }

  async function resetarSenha(userId: number, nome: string) {
    const confirmacao = window.confirm(
      `Deseja redefinir a senha do usuário ${nome}?`
    );
    if (!confirmacao) return;

    try {
      const res = await fetch(`/api/user/${userId}/reset-password`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao redefinir senha");
      }

      alert(`✅ ${data.message}`);
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  }

  if (loading) return <p>Carregando usuários...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className={styles.divPrincipal}>
      <div className={styles.divEsquerdaTelaUsuario}>
        <div className={styles.divTituloUsuario} onClick={abrirCadastro}>
          <h1 style={{ margin: 0 }}>Usuários</h1>
          {podeAdicionarUsuario && (
            <FaPlus color="#000000" style={{ cursor: "pointer" }} />
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por matrícula, nome, unidade ou login"
        className={styles.inputPesquisarUsuario}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className={styles.divSecundaria}>
        <div className={styles.divEsquerdaTelaUsuario}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`${styles.usuarioCard} ${
                selectedUser?.id === user.id ? styles.selectedCard : ""
              }`}
              onClick={() =>
                setSelectedUser(selectedUser?.id === user.id ? null : user)
              }
            >
              <div style={{ display: "flex" }}>
                {user.imagemUrl ? (
                  <Image
                    width={20}
                    height={20}
                    src={user.imagemUrl}
                    alt={`Foto de ${user.nomeGuerra}`}
                    className={styles.usuarioImagem}
                  />
                ) : (
                  <FaUser className={styles.usuarioSemImagem} />
                )}

                <div className={styles.usuarioInfo}>
                  <span className={styles.usuarioNome}>
                    {user.pg} {user.nomeGuerra}{" "}
                    {user.ome?.nomeOme ?? "OME não informada"}
                  </span>
                  <div style={{ display: "flex" }}>
                    <span className={styles.usuarioFuncao}>{user.mat}</span>
                    <FaUser className={styles.iconUsuarioList} />
                    <span className={styles.usuarioFuncao}>{user.funcao}</span>
                    <FaPhone className={styles.iconUsuarioList} />
                    <span className={styles.usuarioFuncao}>{user.phone}</span>
                  </div>
                </div>

                {/* Ícones de edição/exclusão no canto superior direito */}
                <div className={styles.usuarioEditarExcluirIcon}>
                  {podeEditarOuExcluir(user) && (
                    <div className={styles.usuarioEditarExcluirIcon}>
                      <FaKey
                        style={{
                          cursor: "pointer",
                          color: "#272427",
                          marginRight: "8px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          resetarSenha(user.id, user.nomeGuerra);
                        }}
                      />

                      <FaEdit
                        style={{
                          cursor: "pointer",
                          color: "#ee720c",
                          marginRight: "8px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirEdicao(user);
                        }}
                      />
                      <FaTrash
                        style={{ cursor: "pointer", color: "#ee0c0c" }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirm = window.confirm(
                            `Deseja realmente excluir ${user.nomeGuerra}?`
                          );
                          if (!confirm) return;

                          try {
                            const res = await fetch(`/api/user/${user.id}`, {
                              method: "DELETE",
                            });

                            if (!res.ok) {
                              const result = await res.json();
                              throw new Error(
                                result.message || "Erro ao excluir usuário"
                              );
                            }

                            setUsers((prev) =>
                              prev.filter((u) => u.id !== user.id)
                            );
                            if (selectedUser?.id === user.id)
                              setSelectedUser(null);
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedUser?.id === user.id && (
                <div className={styles.usuarioDetalhesMobile} data-mobile-only>
                  <ul>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaUser />
                        {user.loginSei}
                      </div>
                      <FaCheck />
                    </li>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaAt />
                        {user.email}
                      </div>
                      <FaCheck />
                    </li>
                    <li className={styles.liusuarioDetalhesMobile}>
                      <div className={styles.divusuarioDetalhesMobile}>
                        <FaUniversity />
                        {user.ome?.diretoria?.nomeDiretoria ?? "Não informada"}
                      </div>
                      <FaCheck />
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.divDireitaTelaUsuario}>
          {selectedUser ? (
            <div className={styles.usuarioDetalhes}>
              <ul>
                <li className={styles.liusuarioDetalhes}>
                  <div className={styles.divusuarioDetalhes}>
                    <FaUser />
                    {selectedUser.loginSei}
                  </div>
                  <FaCheck />
                </li>
                <li className={styles.liusuarioDetalhes}>
                  <div className={styles.divusuarioDetalhes}>
                    <FaAt />
                    {selectedUser.email}
                  </div>
                  <FaCheck />
                </li>
                <li className={styles.liusuarioDetalhes}>
                  <div className={styles.divusuarioDetalhes}>
                    <FaUniversity />
                    {selectedUser.ome?.diretoria?.nomeDiretoria ??
                      "Não informada"}
                  </div>
                  <FaCheck />
                </li>
              </ul>
            </div>
          ) : (
            <p>Selecione um usuário para ver os detalhes</p>
          )}
        </div>
      </div>

      {/* Modal usado para cadastro e edição */}
      {isEditando ? (
        <EditarUsuarioModal
          isOpen={mostrarModal}
          onClose={() => {
            setMostrarModal(false);
            setModalData(null);
          }}
          initialData={modalData}
          onSubmit={async (dadosusuarios) => {
            const url = `/api/user/${dadosusuarios.id}`;
            const method = "PATCH";

            try {
              const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosusuarios),
              });

              const result = await res.json();

              if (!res.ok) {
                const msg =
                  result?.details?.message ||
                  result?.message ||
                  result?.error ||
                  "Erro ao editar usuário.";
                alert(`Erro: ${msg}`);
                return;
              }

              setUsers((prev) =>
                prev.map((u) => (u.id === result.id ? result : u))
              );

              setMostrarModal(false);
              setModalData(null);
            } catch (error) {
              alert("Erro interno ao editar usuário.");
            }
          }}
        />
      ) : (
        <CadastrarUsuarioModal
          isOpen={mostrarModal}
          onClose={() => {
            setMostrarModal(false);
            setModalData(null);
          }}
          initialData={modalData}
          onSubmit={async (dadosusuarios) => {
            const url = "/api/user";
            const method = "POST";

            try {
              const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosusuarios),
              });

              const result = await res.json();

              if (!res.ok) {
                const msg =
                  result?.details?.message ||
                  result?.message ||
                  result?.error ||
                  "Erro ao cadastrar usuário.";
                alert(`Erro: ${msg}`);
                return;
              }

              setUsers((prev) => [...prev, result]);

              setMostrarModal(false);
              setModalData(null);
            } catch (error) {
              alert("Erro interno ao cadastrar usuário.");
            }
          }}
        />
      )}
    </div>
  );
}
