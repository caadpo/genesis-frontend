import { NextRequest, NextResponse } from "next/server";

// 🧩 Usando a variável de ambiente para definir a base da API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";
const API_BASE = `${API_BASE_URL}/api/pjesevento`;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");
  const codVerba = searchParams.get("codVerba");

  // ✅ Recupera usuário decodificando o token JWT
  let typeUser: number | null = null;
  let omeId: number | null = null;

  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    typeUser = payload.typeUser;
    omeId = payload.omeId;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  // 🔀 Monta a URL da API com base no tipo do usuário
  const queryParams = new URLSearchParams();
  if (ano) queryParams.append("ano", ano);
  if (mes) queryParams.append("mes", mes);
  if (codVerba) queryParams.append("codVerba", codVerba);

  let url = "";

  if (typeUser === 1 && omeId) {
    // Usuário comum: buscar eventos da OME dele
    url = `${API_BASE_URL}/api/ome/${omeId}/eventos?${queryParams.toString()}`;
  } else if (typeUser === 3 || typeUser === 5 || typeUser === 10) {
    // Admin ou tipo especial: buscar eventos de todas as OMEs
    url = `${API_BASE_URL}/api/ome/eventos?${queryParams.toString()}`;
  } else {
    return NextResponse.json({ error: "Tipo de usuário não autorizado" }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao buscar eventos" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


// 📝 POST novo evento
export async function POST(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao criar evento" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar evento" },
      { status: 500 }
    );
  }
}
