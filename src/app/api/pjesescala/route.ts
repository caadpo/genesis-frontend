// src/app/api/pjesescala/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const operacaoId = searchParams.get("operacaoId");
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  try {
    // Monta a URL com filtros, se fornecidos
    const queryParams = new URLSearchParams();
    if (operacaoId) queryParams.append("operacaoId", operacaoId);
    if (ano) queryParams.append("ano", ano);
    if (mes) queryParams.append("mes", mes);

    const apiUrl = `${API_BASE_URL}/api/pjesescala${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const res = await fetch(apiUrl, {
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
    console.error("Erro ao buscar PJES:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/api/pjesescala`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao criar escala" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao criar escala:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar escala" },
      { status: 500 }
    );
  }
}
