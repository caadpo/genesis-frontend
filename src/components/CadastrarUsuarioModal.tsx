"use client";
import { useState, useEffect } from "react";
import styles from "@/app/(privada)/privateLayout.module.css";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { useUser } from "@/app/context/UserContext";

const funcaoToTypeUser = {
  Auxiliar: 1,
  Comum: 2,
  Diretor: 3,
  Superintendente: 4,
  Tecnico: 5,
  Master: 10,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: any) => void;
};

export default function CadastrarUsuarioModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    loginSei: "",
    email: "",
    phone: "",
    nomeGuerra: "",
    mat: "",
    pg: "",
    funcao: "",
    omeId: "",
    typeUser: 1,
  });

  const [omes, setOmes] = useState([]);
  const user = useUser();
  const mostrarSelectOme = user?.typeUser === 5 || user?.typeUser === 10;

  // Buscar dados do SGP pela matrícula
  useEffect(() => {
    const fetchDadosSgp = async () => {
      const mat = String(form.mat).trim();
      if (!/^\d{7}$/.test(mat)) return;

      try {
        const res = await fetch(`/api/dadossgp/${mat}`);
        const data = await res.json();

        if (res.ok) {
          const tipoRestrito = [1, 3, 4];
          const omeSgp = data.omeSgp?.trim();
          const omeDoUsuario = user?.ome?.nomeOme?.trim();

          const normalizeOme = (str: string) =>
            str
              .replace(/[ºÂªÃ]/g, "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^\w\s]/gi, "")
              .toUpperCase()
              .trim();

          const omeSgpNorm = normalizeOme(omeSgp || "");
          const omeUsuarioNorm = normalizeOme(omeDoUsuario || "");

          if (
            user?.typeUser !== undefined &&
            tipoRestrito.includes(user.typeUser) &&
            omeSgpNorm !== omeUsuarioNorm
          ) {
            alert("Você não pode cadastrar policiais de outra OME.");
            return;
          }

          setForm((prev) => ({
            ...prev,
            pg: data.pgSgp ?? "",
            nomeGuerra: data.nomeGuerraSgp ?? "",
            omeId: [5, 10].includes(user?.typeUser ?? -1)
              ? ""
              : String(user?.omeId ?? ""),
          }));
        } else {
          alert("Essa matrícula não existe. Contate o Usuário Master.");
          console.error("Erro da API:", data.error);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchDadosSgp();
  }, [form.mat, user]);

  // Buscar OMEs caso usuário possa escolher
  useEffect(() => {
    const fetchOmes = async () => {
      if (user?.typeUser === 5 || user?.typeUser === 10) {
        try {
          const res = await fetch("/api/ome");
          const data = await res.json();
          if (res.ok) {
            setOmes(data);
          } else {
            console.error("Erro ao buscar OMEs:", data.message);
          }
        } catch (error) {
          console.error("Erro ao buscar OMEs:", error);
        }
      }
    };

    fetchOmes();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "loginSei") {
      // Permite apenas letras minúsculas, ponto e underscore
      const formatted = value.replace(/[^a-z0-9._]/g, "");
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "phone") {
      // Aplica máscara no telefone
      const cleaned = value.replace(/\D/g, "").slice(0, 11);
      const match = cleaned.match(/^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/);
      let masked = "";

      if (match) {
        const [, ddd, n1, n2, n3] = match;
        if (ddd) masked += `(${ddd}`;
        if (ddd && ddd.length === 2) masked += `)`;
        if (n1) masked += `${n1}.`;
        if (n2) masked += `${n2}`;
        if (n3) masked += `-${n3}`;
      }

      setForm((prev) => ({ ...prev, [name]: masked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [botaoHabilitado, setBotaoHabilitado] = useState(false);
  useEffect(() => {
    const habilitar =
      String(form.mat).trim() !== "" && form.loginSei.trim() !== "";
    setBotaoHabilitado(habilitar);
  }, [form.mat, form.loginSei]);

  const handleSubmit = () => {
    const typeUser =
      funcaoToTypeUser[form.funcao as keyof typeof funcaoToTypeUser];

    console.log("DEBUG - Envio do formulário", form);

    if (
      !form.loginSei ||
      !form.mat ||
      !form.pg ||
      !form.nomeGuerra ||
      !form.funcao ||
      (mostrarSelectOme && !form.omeId)
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      loginSei: form.loginSei,
      email: form.email,
      phone: form.phone,
      nomeGuerra: form.nomeGuerra,
      mat: Number(form.mat),
      pg: form.pg.trim(),
      omeId: Number(form.omeId),
      funcao: form.funcao,
      typeUser,
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlayCadUsuario} onClick={onClose}>
      <div
        className={styles.cadUsuarioModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalRightCadUsuario}>
          <h3 style={{ fontSize: "15px", paddingBottom: "10px" }}>
            <strong>Novo Usuário</strong>
          </h3>

          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "1rem", display: "flex" }}>
              <div style={{ width: "20%" }}>
                <FaUser className={styles.imgCadUsuario} />
              </div>

              <div style={{ width: "80%" }}>
                <input
                  className={styles.inputCadUsuarioApenasinput}
                  name="mat"
                  placeholder="Matrícula"
                  value={form.mat}
                  type="text"
                  onChange={handleChange}
                  readOnly={false} // matrícula editável no cadastro
                />

                <input
                  className={styles.inputCadUsuarioApenasinput}
                  name="loginSei"
                  placeholder="Login SEI"
                  value={form.loginSei}
                  onChange={handleChange}
                />
                <input
                  className={styles.inputCadUsuarioApenasinput}
                  name="phone"
                  placeholder="Telefone"
                  value={form.phone}
                  onChange={handleChange}
                />
                <select
                  className={styles.inputCadUsuario}
                  name="funcao"
                  value={form.funcao}
                  onChange={handleChange}
                >
                  <option value="">Selecione a função</option>
                  {([1, 2, 3, 4].includes(user?.typeUser ?? -1)
                    ? ["Comum", "Auxiliar"]
                    : [
                        "Comum",
                        "Auxiliar",
                        "Diretor",
                        "Superintendente",
                        "Tecnico",
                        "Master",
                      ]
                  ).map((funcao) => (
                    <option key={funcao} value={funcao}>
                      {funcao}
                    </option>
                  ))}
                </select>

                {mostrarSelectOme && (
                  <select
                    className={styles.inputCadUsuario}
                    name="omeId"
                    value={form.omeId}
                    onChange={handleChange}
                  >
                    <option value="">Escolha uma Unidade</option>
                    {omes.map((ome: any) => (
                      <option key={ome.id} value={ome.id}>
                        {ome.nomeOme}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <FaUser style={{ fontSize: "20px" }} />
              <label>{form.pg || "Digite a matrícula"}</label>
              <label>{form.nomeGuerra || ""}</label>
              <label>{form.omeId || ""}</label>
            </div>

            <hr className={styles.hrSeiFuncaoTelEmail} />

            <div
              className={styles.botaoFooterCadUsuario}
              onClick={botaoHabilitado ? handleSubmit : undefined}
              style={{
                opacity: botaoHabilitado ? 1 : 0.5,
                cursor: botaoHabilitado ? "pointer" : "not-allowed",
              }}
            >
              <FaSignOutAlt className={styles.menuIcon} />
              <span>Liberar Acesso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
