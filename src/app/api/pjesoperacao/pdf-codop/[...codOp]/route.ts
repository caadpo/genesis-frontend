import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

export async function GET(request: NextRequest, context: any) {
  const params = context.params; // já vem resolvido
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
    const backendUrl = `${API_BASE_URL}/api/pjesoperacao/pdf/${encodeURIComponent(
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
