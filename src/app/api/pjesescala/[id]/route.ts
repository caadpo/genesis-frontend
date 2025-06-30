import { NextRequest, NextResponse } from "next/server";

// PUT: atualizar um escala
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const res = await fetch(`http://localhost:8081/pjesescala/${params.id}`, {
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
        { error: data.message || "Erro ao atualizar escala" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar escala:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar escala" },
      { status: 500 }
    );
  }
}

// DELETE: excluir um escala
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const res = await fetch(`http://localhost:8081/pjesescala/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message || "Erro ao excluir escala" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "escala excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir escala:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir escala" },
      { status: 500 }
    );
  }
}
