'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Upload, ArrowLeft, ImageIcon } from "lucide-react";

export default function SavedSurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ show: false, message: '', isError: false });
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stats, setStats] = useState({ total: 0, withPhoto: 0 });

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/saved-surveys');
      const data = await response.json();
      const surveyList = data.surveys || [];
      setSurveys(surveyList);
      
      // Calculate stats
      setStats({
        total: surveyList.length,
        withPhoto: surveyList.filter(s => s.profile_picture).length
      });
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      setStatus({
        show: true,
        message: 'Falha ao carregar pesquisas',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (survey) => {
    setEditingSurvey({
      ...survey,
      newName: survey.name
    });
    setSelectedFile(null);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/saved-surveys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingSurvey.id,
          name: editingSurvey.newName,
          profilePicture: selectedFile || editingSurvey.profile_picture
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({
          show: true,
          message: 'Pesquisa atualizada com sucesso!',
          isError: false
        });
        setSurveys(surveys.map(s => 
          s.id === editingSurvey.id ? data.survey : s
        ));
        setEditingSurvey(null);
        fetchSurveys(); // Refresh stats
      } else {
        throw new Error(data.error || 'Falha ao atualizar pesquisa');
      }
    } catch (error) {
      setStatus({
        show: true,
        message: `Erro: ${error.message}`,
        isError: true
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pesquisa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/saved-surveys?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({
          show: true,
          message: 'Pesquisa excluída com sucesso!',
          isError: false
        });
        setSurveys(surveys.filter(s => s.id !== id));
        fetchSurveys(); // Refresh stats
      } else {
        throw new Error(data.error || 'Falha ao excluir pesquisa');
      }
    } catch (error) {
      setStatus({
        show: true,
        message: `Erro: ${error.message}`,
        isError: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Link href="/surveys">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Pesquisas
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight mb-1">Pesquisas Salvas</h1>
              <p className="text-muted-foreground">
                Gerencie suas pesquisas salvas e fotos de perfil
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pesquisas Salvas</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Foto de Perfil</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {((stats.withPhoto / stats.total) * 100).toFixed(1)}%
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withPhoto}</div>
                <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(stats.withPhoto / stats.total) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {status.show && (
            <div className={`p-4 rounded-lg ${
              status.isError 
                ? 'bg-destructive/15 text-destructive border border-destructive/50' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {status.message}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Todas as Pesquisas Salvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Foto</TableHead>
                      <TableHead className="max-w-[200px]">ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell>
                          <div className="w-10 h-10 relative">
                            {survey.profile_picture ? (
                              <Image
                                src={survey.profile_picture}
                                alt={`Foto de ${survey.name}`}
                                fill
                                className="rounded-full object-cover ring-2 ring-background"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center ring-2 ring-background">
                                <span className="text-muted-foreground text-sm">{survey.name[0]}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {survey.id}
                        </TableCell>
                        <TableCell>
                          {editingSurvey?.id === survey.id ? (
                            <Input
                              type="text"
                              value={editingSurvey.newName}
                              onChange={(e) => setEditingSurvey({
                                ...editingSurvey,
                                newName: e.target.value
                              })}
                            />
                          ) : (
                            <span className="font-medium">{survey.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(survey.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingSurvey?.id === survey.id ? (
                            <div className="flex justify-end gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id={`profile-${survey.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`profile-${survey.id}`).click()}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={handleUpdate}
                                size="sm"
                              >
                                Salvar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSurvey(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(survey)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(survey.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
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
