import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const pathnameParts = url.pathname.split("/");
  const matSgp = pathnameParts[pathnameParts.length - 1];

  try {
    const res = await fetch(
      `http://localhost:8081/dados-sgp/${matSgp}/mais-recente`,
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
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar policial:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
