import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = request.nextUrl;
  const id = url.pathname.split("/").pop(); // extrai o 'id' da URL
  const mes = url.searchParams.get("mes");
  const ano = url.searchParams.get("ano");
  const codVerba = url.searchParams.get("codVerba");

  const queryParams = new URLSearchParams({ mes: mes ?? "", ano: ano ?? "", codVerba: codVerba ?? "" });

  const finalUrl = `${API_BASE_URL}/api/diretoria/${id}?${queryParams.toString()}`;

  try {
    const res = await fetch(finalUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return res.ok
      ? NextResponse.json(data)
      : NextResponse.json({ error: data.message || "Erro ao buscar dados" }, { status: res.status });
  } catch (error) {
    console.error("Erro na API /api/diretoria/[id]:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
