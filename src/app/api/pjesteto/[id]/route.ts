import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export async function PUT(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  const { id } = context.params;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/pjesteto/${id}`, {
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
        { error: data.message || "Erro ao atualizar" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar PJES Teto:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  const { id } = context.params;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/pjesteto/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json(
        { error: data.message || "Erro ao excluir teto" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Teto removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar PJES Teto:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
