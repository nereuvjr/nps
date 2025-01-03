import { NextResponse } from 'next/server';
import formbricks from '../../formbricks';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Processar os dados recebidos
    console.log('Dados recebidos:', data);
    
    // Aqui você pode adicionar lógica para salvar os dados no banco de dados
    // ou processá-los conforme necessário
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
