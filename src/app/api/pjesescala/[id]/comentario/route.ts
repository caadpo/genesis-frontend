import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = context.params;
  const body = await request.json();

  try {
    const res = await fetch(
      `http://localhost:8081/pjesescala/${id}/comentario`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comentario: body.obs }), // 👈 ajuste do nome do campo
      }
    );

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    // Pega novamente os dados da escala
    const escalaRes = await fetch(`http://localhost:8081/pjesescala/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const escala = await escalaRes.json();
    return NextResponse.json(escala);
  } catch (error) {
    console.error("Erro ao registrar observação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = context.params;

  try {
    const res = await fetch(
      `http://localhost:8081/pjesescala/${id}/comentario`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
