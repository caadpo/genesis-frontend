// src/app/api/ome/[id]/eventos/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");
  const codVerba = searchParams.get("codVerba");

  const queryParams = new URLSearchParams();
  if (ano) queryParams.append("ano", ano);
  if (mes) queryParams.append("mes", mes);
  if (codVerba) queryParams.append("codVerba", codVerba);

  const url = `${API_BASE_URL}/api/ome/${params.id}/eventos?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Erro ao buscar eventos" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro interno ao buscar eventos da OME:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
