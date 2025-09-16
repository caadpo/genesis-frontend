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

    // Define se está em produção para configurar o cookie secure
    const isProduction = process.env.NODE_ENV === "production";
    

    // Resposta com cookie HTTP-only para o accessToken
    const response = NextResponse.json({
      message: "Autenticado com sucesso",
      user: data.user,
    });

    response.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: isProduction,      // true em produção, false em dev
      path: "/",
      sameSite: isProduction ? "none" : "lax", // 'none' para cross-site em HTTPS
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Cookie userData para frontend ler (não HTTP-only)
    response.cookies.set(
      "userData",
      encodeURIComponent(btoa(JSON.stringify(data.user))),
      {
        httpOnly: false,
        secure: isProduction,
        path: "/",
        sameSite: isProduction ? "none" : "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
