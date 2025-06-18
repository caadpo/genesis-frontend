'use client';

import { useUser } from '../../context/UserContext'; // ajuste o caminho conforme necessário

export default function Dashboard() {
  const user = useUser();

  if (!user) return <p>Carregando dados do usuário...</p>;

  return (
    <>
      <h1>Dashboard</h1>
      <p><strong>Bem-vindo:</strong> {user.nomeGuerra} ({user.funcao})</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Telefone:</strong> {user.phone}</p>
      <p><strong>Matrícula:</strong> {user.mat}</p>
      <p><strong>Posto/Graduação:</strong> {user.pg}</p>
      <p><strong>Tipo de Usuário:</strong> {user.typeUser}</p>
      {user.ome && (
        <p><strong>OME:</strong> {user.ome.nomeOme} (ID: {user.ome.id})</p>
      )}
    </>
  );
}
