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

  try {
    const queryParams = new URLSearchParams();
    if (ano) queryParams.append("ano", ano);
    if (mes) queryParams.append("mes", mes);

    const apiUrl = `${API_BASE_URL}/api/pjesescala/minhas-escalas${
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
        { error: data.message || "Erro ao buscar minhas escalas" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar minhas escalas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
