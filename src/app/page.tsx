"use client";

import { useState, useEffect } from 'react';
import { Bike, Fuel, Wrench, History, Play, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { obterEstatisticas, verificarAlertasManutencao } from '@/lib/calculations';
import { getTodayRecord, saveDailyRecord } from '@/lib/storage';
import { Estatisticas, AlertaManutencao } from '@/lib/types';
import AbastecimentoForm from '@/components/AbastecimentoForm';
import ManutencaoForm from '@/components/ManutencaoForm';
import HistoricoView from '@/components/HistoricoView';

export default function MotoboyCockpit() {
  const [modoTrabalho, setModoTrabalho] = useState(false);
  const [tempoAtivo, setTempoAtivo] = useState('');
  const [kmPeriodo, setKmPeriodo] = useState(0);
  const [stats, setStats] = useState<Estatisticas>({
    kmHoje: 0,
    consumoMedio: 0,
    gastoHoje: 0,
    gastoMes: 0,
    kmTotal: 0,
  });
  const [alertas, setAlertas] = useState<AlertaManutencao[]>([]);
  const { kmRodados, error } = useGeolocation(modoTrabalho);

  // Carregar dados iniciais
  useEffect(() => {
    const todayRecord = getTodayRecord();
    if (todayRecord?.modoTrabalhoAtivo) {
      setModoTrabalho(true);
      setKmPeriodo(todayRecord.kmRodados || 0);
    }
    atualizarDados();
  }, []);

  // Atualizar stats quando km mudar
  useEffect(() => {
    if (modoTrabalho) {
      atualizarDados();
      const todayRecord = getTodayRecord();
      if (todayRecord) {
        setKmPeriodo(todayRecord.kmRodados || 0);
      }
    }
  }, [kmRodados, modoTrabalho]);

  // Timer do tempo ativo
  useEffect(() => {
    if (!modoTrabalho) {
      setTempoAtivo('');
      return;
    }

    const todayRecord = getTodayRecord();
    if (!todayRecord?.inicioTrabalho) return;

    const updateTimer = () => {
      const inicio = todayRecord.inicioTrabalho!;
      const agora = Date.now();
      const diff = agora - inicio;
      
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (horas > 0) {
        setTempoAtivo(`${horas}h ${minutos}min`);
      } else {
        setTempoAtivo(`${minutos} minutos`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // Atualiza a cada 30s

    return () => clearInterval(interval);
  }, [modoTrabalho]);

  const atualizarDados = () => {
    setStats(obterEstatisticas());
    setAlertas(verificarAlertasManutencao());
  };

  const toggleModoTrabalho = () => {
    const novoModo = !modoTrabalho;
    setModoTrabalho(novoModo);

    const today = new Date().toISOString().split('T')[0];
    const todayRecord = getTodayRecord();

    if (novoModo) {
      // Ativar modo trabalho
      if (todayRecord) {
        saveDailyRecord({
          ...todayRecord,
          modoTrabalhoAtivo: true,
          inicioTrabalho: Date.now(),
        });
      } else {
        saveDailyRecord({
          id: crypto.randomUUID(),
          date: today,
          kmRodados: 0,
          modoTrabalhoAtivo: true,
          inicioTrabalho: Date.now(),
        });
      }
      setKmPeriodo(0);
    } else {
      // Desativar modo trabalho
      if (todayRecord) {
        saveDailyRecord({
          ...todayRecord,
          modoTrabalhoAtivo: false,
        });
      }
      setTempoAtivo('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Motoboy Cockpit
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Controle total da sua jornada
              </p>
            </div>
          </div>
        </div>

        {/* Alertas de Manutenção */}
        {alertas.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20 animate-in fade-in slide-in-from-top-2 duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                Alertas de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alertas.map((alerta, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg transition-all hover:scale-[1.02] duration-200"
                  >
                    <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
                      {alerta.tipo}
                    </span>
                    <Badge variant={alerta.urgente ? 'destructive' : 'secondary'}>
                      {alerta.urgente
                        ? 'Urgente!'
                        : `${alerta.kmRestante.toFixed(0)} km restantes`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modo Trabalho - DESTAQUE ESPECIAL */}
        <Card className={`mb-6 border-2 transition-all duration-500 ${
          modoTrabalho 
            ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-xl shadow-green-200/50 dark:shadow-green-900/30 animate-in fade-in slide-in-from-top-3' 
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Controles principais */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full transition-all duration-300 ${
                      modoTrabalho
                        ? 'bg-green-500 shadow-lg shadow-green-300/50 dark:shadow-green-700/50 animate-pulse'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    {modoTrabalho ? (
                      <Square className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${
                      modoTrabalho 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      Modo Trabalho
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {modoTrabalho
                        ? 'Rastreando sua quilometragem'
                        : 'Inicie para registrar km'}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={toggleModoTrabalho}
                  className={`transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    modoTrabalho
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-300/50'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-300/50'
                  }`}
                >
                  {modoTrabalho ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>
              </div>

              {/* Informações do período ativo */}
              {modoTrabalho && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-white/60 dark:bg-slate-900/60 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rodando há</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {tempoAtivo || 'Calculando...'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">KM neste período</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {kmPeriodo.toFixed(1)} km
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 animate-in fade-in duration-300">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardDescription>KM Hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.kmHoje.toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardDescription>Consumo Médio</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.consumoMedio > 0 ? `${stats.consumoMedio.toFixed(1)} km/l` : '--'}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardDescription>Gasto Hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                R$ {stats.gastoHoje.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardDescription>KM Total</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.kmTotal.toFixed(0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Funcionalidades - NAVEGAÇÃO MELHORADA */}
        <Tabs defaultValue="abastecimento" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-slate-200 dark:bg-slate-800">
            <TabsTrigger 
              value="abastecimento" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Fuel className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Abastecimento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manutencao" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Wrench className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="abastecimento" className="mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <AbastecimentoForm onSave={atualizarDados} />
          </TabsContent>

          <TabsContent value="manutencao" className="mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <ManutencaoForm onSave={atualizarDados} />
          </TabsContent>

          <TabsContent value="historico" className="mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <HistoricoView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
