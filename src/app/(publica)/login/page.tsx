'use client';

import { useState } from 'react';
import styles from './login.module.css';

export default function Login() {
  const [loginSei, setLoginSei] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
        //const response = await fetch('/api/auth/login', {
        const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginSei, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Erro no login ou na senha');
        return;
      }

      // 👉 Salvando token manualmente (visível no client — não httpOnly)
      localStorage.setItem('accessToken', result.accessToken);

      // Redireciona
      window.location.href = '/dashboard';
    } catch (err) {
      setErrorMessage('Erro de rede ou servidor indisponível.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <label htmlFor="loginSei">Login SEI</label>
          <input
            id="loginSei"
            type="text"
            value={loginSei}
            onChange={(e) => setLoginSei(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
