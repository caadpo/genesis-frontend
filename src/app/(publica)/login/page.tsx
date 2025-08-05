"use client";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import styles from "./login.module.css";
import Image from "next/image";

export default function Login() {
  const [loginSei, setLoginSei] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const apiUrl =
        //process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        process.env.NEXT_PUBLIC_FRONTEND_API || "http://localhost:3000";

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginSei, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Erro no login ou na senha");
        return;
      }

      localStorage.setItem("accessToken", result.accessToken);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMessage("Erro de rede ou servidor indisponível.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topText}>Sistema de Controle</div>
        <div className={styles.subText}>Genesis</div>
      </div>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <div className={styles.imageContainer}>
            <Image
              src="/assets/images/logo_dpo.png"
              alt="logo"
              width={150}
              height={150}
            />
          </div>
          <div className={styles.inputWithIcon}>
            <FaUser className={styles.icon} />
            <input
              id="loginSei"
              type="text"
              value={loginSei}
              onChange={(e) => setLoginSei(e.target.value)}
              required
              className={styles.input}
              placeholder="Usuário"
            />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <FaLock className={styles.icon} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Senha"
            />
          </div>
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "ACESSANDO..." : "ACESSAR"}
        </button>
      </form>
    </div>
  );
}
