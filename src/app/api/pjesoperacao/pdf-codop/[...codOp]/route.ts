import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ codOp: string[] }> }
) {
  const params = await context.params; // espera o params
  const codOpArray = params.codOp; // array com os segmentos
  const codOp = codOpArray.join("/"); // monta o valor original, com "/"

  const token = request.cookies.get("accessToken")?.value;
  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano");
  const mes = searchParams.get("mes");

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // Aqui monta a URL pro backend exatamente igual que você usa no Postman
    // Importante: encodeURIComponent para todo o parâmetro que contém "/"
    const backendUrl = `${API_BASE_URL}/pjesoperacao/pdf/${encodeURIComponent(
      codOp
    )}?mes=${mes}&ano=${ano}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Erro ao buscar operação" },
        { status: res.status }
      );
    }

    // O backend retorna um PDF, então pega o arrayBuffer e retorna como resposta
    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=operacao-${codOpArray.join(
          "-"
        )}.pdf`,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar operação por codOp:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar operação" },
      { status: 500 }
    );
  }
}
