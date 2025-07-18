"use client";

import { useUser } from "../../context/UserContext";
import "react-calendar/dist/Calendar.css";

export default function Dashboard() {
  const user = useUser();

  if (!user) return <p>Carregando dados do usuário...</p>;

  return (
    <>
      <h1>Dashboard</h1>
    </>
  );
}
