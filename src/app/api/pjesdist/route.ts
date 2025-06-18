// src/app/api/pjesteto/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    try {
        const res = await fetch('http://localhost:8081/pjesdist', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        console.log('Dados recebidos da API externa do pjesdist:', data);


        if (!res.ok) {
            return NextResponse.json({ error: data.message || 'Erro ao buscar dados' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar PJES:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
