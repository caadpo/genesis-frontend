import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");
  const diretoria = searchParams.get("diretoria");

  let backendUrl = `${API_BASE_URL}/api/pjesteto`;

  const queryParams: string[] = [];
  if (ano) queryParams.push(`ano=${ano}`);
  if (mes) queryParams.push(`mes=${mes}`);
  if (diretoria) queryParams.push(`diretoria=${encodeURIComponent(diretoria)}`);

  if (queryParams.length > 0) {
    backendUrl += `?${queryParams.join("&")}`;
  }

  try {
    const res = await fetch(backendUrl, {
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
