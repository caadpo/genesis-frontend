// src/app/api/pjesevento/impedidos/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";
const API_URL = `${API_BASE_URL}/api/pjesevento/impedidos/resumo`;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar impedidos" },
        { status: res.status }
      );
    }

    // Se tiver ano/mes no query, filtrar no frontend
    const filtrado = (ano && mes)
      ? data.filter((item: any) => item.ano == ano && item.mes == mes)
      : data;

    return NextResponse.json(filtrado);
  } catch (error) {
    console.error("Erro ao buscar impedidos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
