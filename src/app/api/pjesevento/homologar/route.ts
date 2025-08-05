// src/app/api/pjesevento/homologar/route.ts
import { NextRequest, NextResponse } from "next/server";

// Usa a variável de ambiente com fallback para localhost
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

  if (!ano || !mes) {
    return NextResponse.json(
      { error: "Parâmetros 'mes' e 'ano' são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Usa a URL completa com os parâmetros
    const res = await fetch(
      `${API_BASE_URL}/pjesevento/homologartodoseventodomes?mes=${mes}&ano=${ano}`,
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
        { error: data.error || "Erro ao homologar eventos" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao homologar eventos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
