// src/app/api/user/[id]/reset-password/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    if (!token) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `http://localhost:8081/user/reset-password/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao resetar senha", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro interno ao resetar senha", details: error.message },
      { status: 500 }
    );
  }
}
