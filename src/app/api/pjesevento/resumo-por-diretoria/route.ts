import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:8081/pjesevento/resumo-por-diretoria";

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

  const queryParams = new URLSearchParams();
  if (ano) queryParams.append("ano", ano);
  if (mes) queryParams.append("mes", mes);
  if (omeMin) queryParams.append("omeMin", omeMin);
  if (omeMax) queryParams.append("omeMax", omeMax);

  const url = `${API_URL}?${queryParams.toString()}`;

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
