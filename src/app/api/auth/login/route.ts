// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginSei = String(body.loginSei || "").trim();
    const password = String(body.password || "").trim();

    const externalApiResponse = await fetch("http://localhost:8081/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loginSei, password }),
    });

    const data = await externalApiResponse.json();

    if (!externalApiResponse.ok) {
      // Aqui repassamos a mensagem original da API externa
      return NextResponse.json(
        { error: data.message || "Erro ao autenticar" },
        { status: externalApiResponse.status }
      );
    }

    const response = NextResponse.json({ message: "Autenticado com sucesso" });

    // Setar token em cookie
    response.cookies.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // 💡 ADICIONE ISSO: salvar userData visível no lado do cliente
    response.cookies.set(
      "userData",
      encodeURIComponent(btoa(JSON.stringify(data.user))),
      {
        httpOnly: false, // importante: visível para o frontend
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
