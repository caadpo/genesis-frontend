import { NextRequest, NextResponse } from "next/server";

// PUT: atualizar um evento
export async function PUT(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  try {
    const res = await fetch(`http://localhost:8081/pjesevento/${id}`, {
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
        { error: data.message || "Erro ao atualizar evento" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE: excluir um evento
export async function DELETE(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const res = await fetch(`http://localhost:8081/pjesevento/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || "Erro ao excluir evento" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Evento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir evento" },
      { status: 500 }
    );
  }
}
