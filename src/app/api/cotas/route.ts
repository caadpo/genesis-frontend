// src/app/api/cotas/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1️⃣ Buscar token do cookie
  let token = request.cookies.get("accessToken")?.value;

  // 2️⃣ Se não achar, tentar buscar do header Authorization
  if (!token) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
  }

  // 3️⃣ Se ainda assim não houver token, retornar erro
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 4️⃣ Extrair parâmetros da URL
  const { searchParams } = new URL(request.url);
  const matSgp = searchParams.get("matSgp");
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  if (!matSgp || !ano || !mes) {
    return NextResponse.json(
      { message: "Parâmetros ausentes" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `http://localhost:8081/pjesescala/cotas?matSgp=${matSgp}&ano=${ano}&mes=${mes}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erro no backend" },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar cotas:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
