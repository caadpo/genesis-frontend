// src/app/api/pjesescala/excel/route.ts
import { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");
  const regularOuAtrasado = searchParams.get("regularOuAtrasado");

  if (!token) {
    return new Response("Não autenticado", { status: 401 });
  }

  const backendUrl = `${API_BASE_URL}/prestarconta/excel?mes=${mes}&ano=${ano}&regularOuAtrasado=${regularOuAtrasado}`;

  const res = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text(); // só lê o corpo aqui se necessário
    console.error("Erro no backend:", errorText);
    return new Response("Erro no backend", { status: res.status });
  }

  const arrayBuffer = await res.arrayBuffer();
  console.log("Tamanho do arquivo:", arrayBuffer.byteLength);

  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename=escala_${mes}_${ano}.xlsx`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
