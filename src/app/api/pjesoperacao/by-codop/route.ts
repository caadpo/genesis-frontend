// src/app/api/pjesoperacao/by-codop/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const codOp = searchParams.get("codOp");

    if (!codOp) {
      return NextResponse.json({ error: "codOp não fornecido" }, { status: 400 });
    }

    const res = await fetch(
      `${API_BASE_URL}/api/pjesoperacao/by-codop?codOp=${encodeURIComponent(codOp)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar operação" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar operação por codOp:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar operação" },
      { status: 500 }
    );
  }
}
