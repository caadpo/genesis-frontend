import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

// GET operacao
export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // Pega os parâmetros da URL original
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");

    // Monta a URL para o backend com query params, se existirem
    const url = new URL(`${API_BASE_URL}/pjesoperacao`);
    if (ano) url.searchParams.append("ano", ano);
    if (mes) url.searchParams.append("mes", mes);

    const res = await fetch(url.toString(), {
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
    console.error("Erro ao buscar operacoes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST novo operacao
export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const res = await fetch(`${API_BASE_URL}/pjesoperacao`, {
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
        { error: data.message || "Erro ao criar operacao" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao criar operacao:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar operacao" },
      { status: 500 }
    );
  }
}
