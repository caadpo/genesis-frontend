import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const matricula = searchParams.get("mat");

  if (!matricula || matricula.length !== 7) {
    return NextResponse.json({ error: "Matrícula inválida" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/user/dados-por-matricula?mat=${matricula}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar policial" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar policial:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
