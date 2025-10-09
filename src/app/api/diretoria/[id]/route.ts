import { NextRequest, NextResponse } from "next/server";
import { parse } from "url";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const codVerba = searchParams.get("codVerba");

  const id = params.id;

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
      console.error("❌ Erro ao buscar diretoria:", data);
      return NextResponse.json(
        { error: data.message || "Erro ao buscar diretoria" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Erro interno ao buscar diretoria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
