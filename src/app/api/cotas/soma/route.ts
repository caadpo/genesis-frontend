// src/app/api/cotas/soma/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 🔒 1. Buscar token JWT do cookie
  let token = request.cookies.get("accessToken")?.value;

  // 🔒 2. Se não tiver no cookie, tentar do header Authorization
  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
  }

  // 🔒 3. Se ainda não houver token, retornar erro
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ 4. Obter parâmetros da URL
  const { searchParams } = new URL(request.url);
  const matSgp = searchParams.get("matSgp");
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  if (!matSgp || !ano || !mes) {
    return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });
  }

  try {
    // ✅ 5. Fazer chamada ao backend com o token
    const res = await fetch(
      `http://localhost:8081/pjesescala/quantidade?matSgp=${matSgp}&ano=${ano}&mes=${mes}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro da API externa: ${res.status}` },
        { status: res.status }
      );
    }

    const quantidade = Number(raw);
    return NextResponse.json({ quantidade });
  } catch (error) {
    console.error("Erro na rota /api/cotas/soma:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar quantidade" },
      { status: 500 }
    );
  }
}
