import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  try {
    const res = await fetch(`http://localhost:8081/pjesescala/${id}/obs`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    const escalaRes = await fetch(`http://localhost:8081/pjesescala/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const escala = await escalaRes.json();
    return NextResponse.json(escala);
  } catch (error) {
    console.error("Erro ao atualizar observação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
