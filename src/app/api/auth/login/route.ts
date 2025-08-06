// src/app/api/auth/login/route.ts
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
      // Repasse a mensagem original da API externa
      return NextResponse.json(
        { error: data.message || "Erro ao autenticar" },
        { status: externalApiResponse.status }
      );
    }

    // Cria a resposta JSON incluindo token e user para o frontend usar
    const response = NextResponse.json({
      message: "Autenticado com sucesso",
      accessToken: data.accessToken,
      user: data.user,
    });

    // Setar token em cookie HTTP-only
    response.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Salvar dados do usuário em cookie visível no cliente (não httpOnly)
    response.cookies.set(
      "userData",
      encodeURIComponent(btoa(JSON.stringify(data.user))),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
