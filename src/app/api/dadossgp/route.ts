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
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const matricula = url.searchParams.get("matricula");

  if (!matricula) {
    return NextResponse.json(
      { error: "Matrícula não fornecida" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`http://localhost:8081/dados-sgp/${matricula}`, {
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
    console.error("Erro ao buscar dados do SGP:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
