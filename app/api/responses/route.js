import { NextResponse } from 'next/server';
import { getEnvVariable } from '@/lib/utils';

// Função para calcular o NPS
function calculateNPS(responses) {
  const total = responses.count;
  if (total === 0) return 0;

  let promoters = 0;
  let detractors = 0;

  Object.entries(responses.values).forEach(([score, count]) => {
    const numScore = Number(score);
    if (numScore >= 9) {
      promoters += count;
    } else if (numScore <= 6) {
      detractors += count;
    }
  });

  return ((promoters - detractors) / total) * 100;
}

// Função para calcular a média ponderada
function calculateWeightedAverage(responses) {
  const totalResponses = responses.count;
  if (totalResponses === 0) return 0;

  // Definir limites para o fator de confiança
  const MIN_RESPONSES = 1;  // Mínimo de respostas
  const MAX_RESPONSES = 30; // Número ideal de respostas
  const MIN_WEIGHT = 0.3;   // Peso mínimo (30% da nota)
  
  // Calcular o fator de confiança baseado na quantidade de respostas
  // Quanto mais respostas, mais próximo de 1 será o fator
  let confidenceFactor = (totalResponses - MIN_RESPONSES) / (MAX_RESPONSES - MIN_RESPONSES);
  confidenceFactor = Math.max(0, Math.min(1, confidenceFactor)); // Limitar entre 0 e 1
  
  // O peso final será entre MIN_WEIGHT e 1
  const responseWeight = MIN_WEIGHT + (1 - MIN_WEIGHT) * confidenceFactor;

  // Calcular a média simples
  let sum = 0;
  Object.entries(responses.values).forEach(([score, count]) => {
    sum += Number(score) * count;
  });
  const simpleAverage = sum / totalResponses;

  // A média ponderada será uma combinação da média simples com o peso das respostas
  // Se tiver poucas respostas, a nota será mais penalizada
  return simpleAverage * responseWeight;
}

async function fetchResponseDetails(responseId, apiKey, baseUrl) {
  const detailsUrl = `${baseUrl}/management/responses/${responseId}`;
  const response = await fetch(detailsUrl, {
    headers: {
      'x-api-key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch response details for ID ${responseId}`);
  }

  const data = await response.json();
  return data.data;
}

async function fetchAllResponses(surveyId, apiKey, baseUrl) {
  const responses = [];
  let page = 1;
  const limit = 100;
  
  while (true) {
    const apiUrl = `${baseUrl}/management/responses?surveyId=${surveyId}&limit=${limit}&page=${page}`;
    console.log(`Fetching page ${page}...`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from API');
    }

    responses.push(...data.data);

    if (data.data.length < limit) {
      break;
    }

    page++;
    
    if (page > 10) {
      console.warn('Reached maximum page limit');
      break;
    }
  }

  return responses;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }

    const apiKey = getEnvVariable('NEXT_PUBLIC_FORMBRICKS_API_KEY');
    const baseUrl = getEnvVariable('NEXT_PUBLIC_FORMBRICKS_URL');

    console.log('Fetching responses for survey:', surveyId);

    const allResponses = await fetchAllResponses(surveyId, apiKey, baseUrl);
    console.log(`Total responses fetched: ${allResponses.length}`);

    const responses = await Promise.all(
      allResponses.map(async (response) => {
        try {
          const details = await fetchResponseDetails(response.id, apiKey, baseUrl);
          return {
            ...response,
            details
          };
        } catch (error) {
          console.error(`Failed to fetch details for response ${response.id}:`, error);
          return response;
        }
      })
    );

    // Processamento das respostas
    const npsData = {
      total: 0,
      count: 0,
      values: {},
      average: 0,
      weightedAverage: 0,
      npsScore: 0,
      promoters: 0,
      passives: 0,
      detractors: 0
    };

    responses.forEach(r => {
      if (r.details?.data) {
        const filteredData = Object.entries(r.details.data).reduce((filtered, [key, value]) => {
          if (!key.includes('welcomeCard') && value !== 'clicked') {
            filtered[key] = value;
          }
          return filtered;
        }, {});

        const firstResponse = Object.values(filteredData)[0];
        if (firstResponse && !isNaN(Number(firstResponse))) {
          const score = Number(firstResponse);
          npsData.total += score;
          npsData.count++;
          npsData.values[score] = (npsData.values[score] || 0) + 1;

          // Classificação NPS
          if (score >= 9) {
            npsData.promoters++;
          } else if (score >= 7) {
            npsData.passives++;
          } else {
            npsData.detractors++;
          }
        }
      }
    });

    // Cálculo das métricas
    if (npsData.count > 0) {
      npsData.average = npsData.total / npsData.count;
      npsData.weightedAverage = calculateWeightedAverage(npsData);
      npsData.npsScore = calculateNPS(npsData);
    }

    const summary = {
      total: responses.length,
      finished: responses.filter(r => r.finished).length,
      unfinished: responses.filter(r => !r.finished).length,
      lastResponse: responses.length > 0 ? responses[0].createdAt : null,
      npsData
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in responses API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch responses',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
