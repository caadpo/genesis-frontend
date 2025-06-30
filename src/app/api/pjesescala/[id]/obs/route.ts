// src/app/api/pjesescala/[id]/obs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const id = params.id;
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
      return NextResponse.json(
        { error: data.message || "Erro ao atualizar observação" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar observação:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar observação" },
      { status: 500 }
    );
  }
}
