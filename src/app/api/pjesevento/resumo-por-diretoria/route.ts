// src/app/api/pjesevento/resumo-por-diretoria/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");
  const omeMin = searchParams.get("omeMin");
  const omeMax = searchParams.get("omeMax");
  const codVerba = searchParams.get("codVerba");

  const queryParams = new URLSearchParams();
  if (ano) queryParams.append("ano", ano);
  if (mes) queryParams.append("mes", mes);
  if (omeMin) queryParams.append("omeMin", omeMin);
  if (omeMax) queryParams.append("omeMax", omeMax);
  if (codVerba) queryParams.append("codVerba", codVerba);

  const url = `${API_BASE_URL}/pjesevento/resumo-por-diretoria?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar dados" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar resumo por diretoria:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
