import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

  export async function GET(request: NextRequest, context: any) {
    const token = request.cookies.get("accessToken")?.value;
    const { id } = context.params;
  
    console.log("🔐 Token:", token);
    console.log("🔎 ID recebido:", id);
  
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
  
    const url = `${API_BASE_URL}/api/pjesdist/${id}`;
    console.log("🌐 Fazendo fetch para:", url);
  
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const text = await res.text(); // Pega resposta como texto bruto
      console.log("📥 Resposta da API externa:", res.status, text);
  
      if (!res.ok) {
        return NextResponse.json({ error: text || "Erro ao buscar distribuição" }, { status: res.status });
      }
  
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (error) {
      console.error("❌ Erro ao buscar distribuição:", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
  }
  

export async function PUT(request: NextRequest, context: any) {
  const token = request.cookies.get("accessToken")?.value;
  const { id } = context.params;
  const body = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/pjesdist/${id}`, {
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
    console.error("Erro ao atualizar distribuição:", error);
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
    const res = await fetch(`${API_BASE_URL}/api/pjesdist/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao deletar distribuição" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Distribuição deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar distribuição:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
