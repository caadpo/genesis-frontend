import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  let backendUrl = `http://localhost:8081/pjesteto/resumo-por-ome`;
  const queryParams: string[] = [];

  if (ano) queryParams.push(`ano=${ano}`);
  if (mes) queryParams.push(`mes=${mes}`);

  if (queryParams.length > 0) {
    backendUrl += `?${queryParams.join("&")}`;
  }

  try {
    const res = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
