// src/app/api/diretoria/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

// 🔧 Função auxiliar para extrair o ID da URL
function getIdFromUrl(url: string): string | null {
  const parts = url.split("/");
  return parts[parts.length - 1] || null;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const codVerba = searchParams.get("codVerba");

  const id = getIdFromUrl(request.url);

  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  try {
    const url = new URL(`${API_BASE_URL}/api/diretoria/${id}`);
    if (mes) url.searchParams.append("mes", mes);
    if (ano) url.searchParams.append("ano", ano);
    if (codVerba) url.searchParams.append("codVerba", codVerba);

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
        { error: data.message || "Erro ao buscar diretoria" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar diretoria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
