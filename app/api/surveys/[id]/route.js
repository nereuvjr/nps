import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  const environmentId = 'cm0feajcm00086v3bqspdz67j';
  const organizationId = 'cm0fe862p00016v3bzltqchuo';
  
  try {
    const response = await fetch(`https://nps.e-koerner.com.br/api/v1/management/surveys/${id}?environmentId=${environmentId}&organizationId=${organizationId}`, {
      headers: {
        'x-api-key': '02a0529c89f895215cbea487883e2d74'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching survey: ${response.status}`);
    }

    const survey = await response.json();
    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
