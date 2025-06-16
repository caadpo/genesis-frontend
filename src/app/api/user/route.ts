// src/app/api/user/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Recupera o token de autenticação do cookie correto (accessToken)
    const token = request.cookies.get('accessToken')?.value;

    // Se o token não estiver presente, retorne um erro de "não autorizado"
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    console.log('O token do back é', token);

    // Faz a requisição para o backend para pegar os dados dos usuários, incluindo o token no cabeçalho Authorization
    const response = await fetch('http://localhost:8081/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Coloca o token no cabeçalho Authorization
      },
    });

    // Verifica se a resposta da API é bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API do backend:', errorData);
      return NextResponse.json({ error: 'Erro ao buscar usuários', details: errorData }, { status: response.status });
    }

    // Converte a resposta em JSON
    const data = await response.json();

    // Retorna os dados para o frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro na requisição para /user:', error);
    return NextResponse.json({ error: 'Erro ao buscar os dados dos usuários', details: error.message }, { status: 500 });
  }
}
