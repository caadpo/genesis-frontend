import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // deve ser id, não comentarioId
) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = context.params;

  try {
    const res = await fetch(
      `http://localhost:8081/pjesescala/comentario/${id}`, // aqui backend pode continuar singular
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: JSON.parse(data)?.message || "Erro ao excluir" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir comentário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
