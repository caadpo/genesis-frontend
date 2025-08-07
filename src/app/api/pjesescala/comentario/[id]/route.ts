import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function DELETE(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = context.params;

  try {
    const res = await fetch(`${API_BASE_URL}/api/pjesescala/comentario/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
