import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  console.log("Cookies disponíveis:", request.cookies);
  console.log("Token recebido:", token);


  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");

    const query = new URLSearchParams();
    if (ano) query.append("ano", ano);
    if (mes) query.append("mes", mes);

    const res = await fetch(`${API_BASE_URL}/api/pjesteto?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,  // ENVIA O TOKEN NO HEADER
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

    const res = await fetch(`${API_BASE_URL}/api/pjesteto`, {
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
        { error: data.message || "Erro ao criar teto" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao criar PJES Teto:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
