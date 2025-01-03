'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users, CheckCircle2, Clock, Languages, Tags, MessageSquare, RefreshCw, Star, Calculator, Trophy, Medal } from "lucide-react";
import { useSearchParams } from 'next/navigation';

// Funções de utilidade fora do componente
const getRankingColor = (position) => {
  switch (position) {
    case 0: return "text-yellow-400"; // Ouro
    case 1: return "text-gray-400";   // Prata
    case 2: return "text-amber-700";  // Bronze
    default: return "text-gray-600";
  }
};

const getRankingIcon = (position) => {
  switch (position) {
    case 0: return <Trophy className="h-5 w-5 text-yellow-400" />;
    case 1: return <Medal className="h-5 w-5 text-gray-400" />;
    case 2: return <Medal className="h-5 w-5 text-amber-700" />;
    default: return null;
  }
};

export default function ResponsesPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [countdown, setCountdown] = useState(600); // 10 minutos em segundos
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId");

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro, buscar todas as pesquisas
      const surveysResponse = await fetch('/api/surveys');
      if (!surveysResponse.ok) throw new Error('Falha ao buscar pesquisas');
      const surveysData = await surveysResponse.json();
      
      // Para cada pesquisa, buscar suas respostas
      const surveyPromises = surveysData.surveys.map(async (survey) => {
        const responseData = await fetch(`/api/responses?surveyId=${survey.id}`);
        if (!responseData.ok) throw new Error(`Falha ao buscar respostas da pesquisa ${survey.id}`);
        const data = await responseData.json();
        return {
          ...survey,
          ...data
        };
      });

      const allSurveyData = await Promise.all(surveyPromises);
      setSurveys(allSurveyData);
      setLastUpdate(new Date());
      setCountdown(600); // Reseta o contador
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback com dependências vazias

  // Timer para contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          fetchResponses(); // Atualiza automaticamente quando chegar a zero
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchResponses]);

  // Formatar o tempo restante
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]); // Agora fetchResponses é estável e não causa re-renders

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/surveys"
            className="inline-flex items-center text-xl text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-8 w-8" />
            Voltar para Pesquisas
          </Link>

          <div className="flex items-center gap-6">
            <div className="bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-100">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Próxima atualização em:</span>
                <span className="font-bold">{formatCountdown(countdown)}</span>
              </div>
            </div>

            <div className="bg-green-50 px-4 py-2 rounded-lg border-2 border-green-100">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Última atualização:</span>
                <span className="font-bold">
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>

            <Button
              onClick={fetchResponses}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Agora
            </Button>
          </div>
        </div>

        {loading && !surveys.length && (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 p-6 rounded-lg mb-8">
            <p className="text-2xl text-red-800">Erro: {error}</p>
          </div>
        )}

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg mb-8">
          <div className="flex items-center gap-2 text-green-800">
            <RefreshCw className="h-5 w-5" />
            <p className="text-lg">
              Os dados são atualizados automaticamente em tempo real a cada 10 minutos.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {surveys
              .filter(item => item?.summary?.npsData)
              .sort((a, b) => (b.summary.npsData.weightedAverage || 0) - (a.summary.npsData.weightedAverage || 0))
              .slice(0, 3)
              .map((survey, index) => (
                <TopSurveyCard key={survey.id} survey={survey} position={index} />
              ))}
          </div>

          {/* Remaining Surveys */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {surveys
              .filter(item => item?.summary?.npsData)
              .sort((a, b) => (b.summary.npsData.weightedAverage || 0) - (a.summary.npsData.weightedAverage || 0))
              .slice(3)
              .map((survey, index) => (
                <Card key={survey.id} className="bg-white shadow-lg border-2 hover:shadow-xl transition-shadow">
                  <CardHeader className="border-b bg-gray-50 py-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="text-gray-700 font-bold">{index + 4}º</span>
                      <span className="font-bold text-gray-900">{survey.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-4xl font-bold text-blue-800">
                          {survey.summary.npsData.weightedAverage.toFixed(1)}
                        </div>
                        <p className="text-lg text-blue-600">Nota Final</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-800">
                            {survey.summary.npsData.npsScore.toFixed(1)}%
                          </div>
                          <p className="text-base text-green-600">NPS Score</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-purple-800">
                            {survey.summary.npsData.count}
                          </div>
                          <p className="text-base text-purple-600">Respostas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Surveys without NPS data */}
            {surveys
              .filter(item => !item?.summary?.npsData)
              .map((survey) => (
                <Card key={survey.id} className="bg-gray-50 shadow border-2 opacity-80">
                  <CardHeader className="border-b py-4">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                      <span className="font-bold">{survey.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-lg">Sem avaliações</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para os cards do Top 3
const TopSurveyCard = ({ survey, position }) => {
  const { summary } = survey;
  const rankingIcon = getRankingIcon(position);
  const rankingColor = getRankingColor(position);
  const rankingPosition = `${position + 1}º`;

  return (
    <Card className="bg-white shadow-xl border-2 hover:shadow-2xl transition-shadow">
      <CardHeader className="border-b bg-gradient-to-r from-gray-100 to-white py-6">
        <CardTitle className="flex items-center gap-4 text-3xl">
          {rankingIcon}
          <span className={`${rankingColor} font-bold`}>{rankingPosition}</span>
          <span className="font-bold text-gray-900">{survey.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Média Ponderada em destaque */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Nota Final</h3>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-7xl font-bold text-blue-800">
                {summary.npsData.weightedAverage.toFixed(1)}
              </span>
              <div className="text-right">
                <div className="text-xl text-gray-600">
                  {summary.npsData.count} avaliações
                </div>
                <div className="text-lg text-blue-600 font-medium">
                  Média Ponderada
                </div>
              </div>
            </div>
          </div>

          {/* NPS Score */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">NPS Score</h3>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-100">
                <div className="text-2xl font-bold text-red-700">
                  {((summary.npsData.detractors / summary.npsData.count) * 100).toFixed(1)}%
                </div>
                <div className="text-lg text-red-800">Detratores</div>
                <div className="text-xl font-bold text-red-700">{summary.npsData.detractors}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-100">
                <div className="text-2xl font-bold text-yellow-700">
                  {((summary.npsData.passives / summary.npsData.count) * 100).toFixed(1)}%
                </div>
                <div className="text-lg text-yellow-800">Neutros</div>
                <div className="text-xl font-bold text-yellow-700">{summary.npsData.passives}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-100">
                <div className="text-2xl font-bold text-green-700">
                  {((summary.npsData.promoters / summary.npsData.count) * 100).toFixed(1)}%
                </div>
                <div className="text-lg text-green-800">Promotores</div>
                <div className="text-xl font-bold text-green-700">{summary.npsData.promoters}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-4xl font-bold text-gray-800">
                {summary.npsData.npsScore.toFixed(1)}%
              </div>
              <div className="text-lg text-gray-600">Score Final</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-medium text-blue-800">Completas</h4>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700">{summary.finished}</div>
              <p className="text-lg text-blue-600">finalizadas</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-medium text-green-800">Conclusão</h4>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-700">
                {((summary.finished / summary.total) * 100).toFixed(1)}%
              </div>
              <p className="text-lg text-green-600">taxa</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-medium text-purple-800">Média</h4>
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {summary.npsData.average.toFixed(1)}
              </div>
              <p className="text-lg text-purple-600">simples</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
