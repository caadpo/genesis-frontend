import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { matSgp: string } }
) {
  const token = _req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `http://localhost:8081/dados-sgp/${params.matSgp}`,
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
