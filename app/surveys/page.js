'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, BarChart2, Save, RefreshCw } from "lucide-react";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState({ show: false, message: '', isError: false });
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/surveys/sync', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({
          show: true,
          message: data.message,
          isError: false
        });
        
        if (data.newSurveysCount > 0) {
          fetchSurveys();
        }
      } else {
        throw new Error(data.error || 'Falha ao sincronizar pesquisas');
      }
    } catch (error) {
      setStatus({
        show: true,
        message: `Erro: ${error.message}`,
        isError: true
      });
    } finally {
      setSyncing(false);
      setTimeout(() => {
        setStatus({ show: false, message: '', isError: false });
      }, 3000);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      const data = await response.json();
      const surveyList = Array.isArray(data.surveys) ? data.surveys : [];
      setSurveys(surveyList);
      
      // Calculate stats
      setStats({
        total: surveyList.length,
        active: surveyList.filter(s => s.status === 'active').length,
        completed: surveyList.filter(s => s.status === 'completed').length
      });
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      setStatus({
        show: true,
        message: 'Erro ao carregar pesquisas',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      completed: 'secondary',
      draft: 'warning',
      archived: 'outline'
    };
    
    const labels = {
      active: 'Ativa',
      completed: 'Concluída',
      draft: 'Rascunho',
      archived: 'Arquivada'
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1">Pesquisas</h1>
              <p className="text-muted-foreground">
                Gerencie e acompanhe suas pesquisas de satisfação
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/responses">
                <Button variant="outline">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Ver Respostas
                </Button>
              </Link>
              <Link href="/saved-surveys">
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Ver Pesquisas Salvas
                </Button>
              </Link>
              <Button
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar Novas Pesquisas
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pesquisas Ativas</CardTitle>
                <Badge variant="success" className="h-4 px-2">Ativas</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pesquisas Concluídas</CardTitle>
                <Badge variant="secondary" className="h-4 px-2">Concluídas</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Status Messages */}
          {status.show && (
            <div className={`p-4 rounded-lg ${
              status.isError 
                ? 'bg-destructive/15 text-destructive border border-destructive/50' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {status.message}
            </div>
          )}

          {/* Surveys Table */}
          <Card>
            <CardHeader>
              <CardTitle>Todas as Pesquisas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <Link 
                            href={`/surveys/${survey.id}`} 
                            className="font-medium text-primary hover:underline"
                          >
                            {survey.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(survey.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
