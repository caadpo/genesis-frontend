import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  let token = request.cookies.get("accessToken")?.value;

  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const matricula = url.searchParams.get("matricula");
  const mes = url.searchParams.get("mes");
  const ano = url.searchParams.get("ano");

  if (!matricula || !mes || !ano) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios faltando: matrícula, mês ou ano" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/dados-sgp/${matricula}/${mes}/${ano}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar dados" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar dados do SGP:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
