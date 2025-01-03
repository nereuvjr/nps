import { NextResponse } from 'next/server';

export async function GET() {
  const environmentId = 'cm0feajcm00086v3bqspdz67j';
  const organizationId = 'cm0fe862p00016v3bzltqchuo';
  const excludedSurveyIds = [
    'cm0l30y9q000s6v3brez8f3xt',
    'wm7mr695r9t3vikf0fi1dv9u'
  ];
  
  try {
    const response = await fetch(`https://nps.e-koerner.com.br/api/v1/management/surveys`, {
      headers: {
        'x-api-key': '02a0529c89f895215cbea487883e2d74'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const result = await response.json();
    // Filter out the excluded survey IDs
    const filteredSurveys = (result.data || []).filter(survey => 
      !excludedSurveyIds.includes(survey.id)
    );
    
    return NextResponse.json({ surveys: filteredSurveys });
  } catch (error) {
    console.error('Erro ao buscar surveys:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
