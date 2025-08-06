import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginSei = String(body.loginSei || "").trim();
    const password = String(body.password || "").trim();

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://191.252.214.36:4000";

    const externalApiResponse = await fetch(`${baseUrl}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loginSei, password }),
    });

    const data = await externalApiResponse.json();

    if (!externalApiResponse.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao autenticar" },
        { status: externalApiResponse.status }
      );
    }

    // Aqui você configura o cookie HTTP-only com secure: false (pq não está usando HTTPS)
    // e sameSite: "lax" para aceitar em requisições da mesma origem

    const response = NextResponse.json({
      message: "Autenticado com sucesso",
      user: data.user,
    });

    response.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: false,       // se estiver em produção com HTTPS, troque para true
      path: "/",
      sameSite: "lax",     // Lax funciona bem para a maioria dos casos
      maxAge: 60 * 60 * 24 * 7,  // 7 dias de validade (ajuste conforme quiser)
    });

    // Se quiser passar userData para frontend sem ser httpOnly, pode deixar:
    response.cookies.set(
      "userData",
      encodeURIComponent(btoa(JSON.stringify(data.user))),
      {
        httpOnly: false,
        secure: false,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
