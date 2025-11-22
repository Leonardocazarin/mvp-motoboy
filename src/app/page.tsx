"use client";

import { useState, useEffect } from 'react';
import { Bike, Fuel, Wrench, History, Play, Square, AlertTriangle, LogOut, Settings, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGeolocation } from '@/hooks/useGeolocation';
import { obterEstatisticas, verificarAlertasManutencao } from '@/lib/calculations';
import { getTodayRecord, saveDailyRecord } from '@/lib/storage';
import { Estatisticas, AlertaManutencao } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import AbastecimentoForm from '@/components/AbastecimentoForm';
import ManutencaoForm from '@/components/ManutencaoForm';
import HistoricoView from '@/components/HistoricoView';
import MinhaMotoForm from '@/components/MinhaMotoForm';
import { NotificationManager } from '@/components/NotificationManager';

export default function MotoboyCockpit() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modoTrabalho, setModoTrabalho] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [tempoAtivo, setTempoAtivo] = useState('');
  const [kmPeriodo, setKmPeriodo] = useState(0);
  const [stats, setStats] = useState<Estatisticas>({
    kmHoje: 0,
    consumoMedio: 0,
    gastoHoje: 0,
    gastoMes: 0,
    kmTotal: 0,
    tempoTrabalhado: 0,
  });
  const [alertas, setAlertas] = useState<AlertaManutencao[]>([]);
  const { kmRodados, error } = useGeolocation(modoTrabalho, pausado);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado com sucesso');
      }
      
      if (_event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Solicitar permissão para notificações
  useEffect(() => {
    if (user && 'Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [user]);

  // Verificar alertas e enviar notificações
  useEffect(() => {
    if (user && alertas.length > 0) {
      alertas.forEach(alerta => {
        if (alerta.urgente && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Manutenção Urgente!', {
            body: `${alerta.tipo}: Manutenção necessária agora!`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: alerta.tipo,
            requireInteraction: true,
          });
        }
      });
    }
  }, [alertas, user]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      const todayRecord = getTodayRecord();
      if (todayRecord?.modoTrabalhoAtivo) {
        setModoTrabalho(true);
        setPausado(todayRecord.pausado || false);
        setKmPeriodo(todayRecord.kmRodados || 0);
      }
      atualizarDados();
    }
  }, [user]);

  // Atualizar stats quando km mudar
  useEffect(() => {
    if (modoTrabalho && !pausado) {
      atualizarDados();
      const todayRecord = getTodayRecord();
      if (todayRecord) {
        setKmPeriodo(todayRecord.kmRodados || 0);
      }
    }
  }, [kmRodados, modoTrabalho, pausado]);

  // Timer do tempo ativo (atualiza minutos trabalhados)
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
      const tempoPausado = todayRecord.tempoPausadoTotal || 0;
      
      // Se está pausado, adicionar tempo desde início da pausa
      let tempoAtualPausado = tempoPausado;
      if (pausado && todayRecord.inicioPausa) {
        tempoAtualPausado += (agora - todayRecord.inicioPausa);
      }
      
      const diff = agora - inicio - tempoAtualPausado;
      
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      // NÃO atualizar minutos no storage aqui - apenas exibir
      // Os minutos serão salvos quando finalizar o trabalho
      
      if (horas > 0) {
        setTempoAtivo(`${horas}h ${minutos}min`);
      } else {
        setTempoAtivo(`${minutos} minutos`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // Atualiza a cada 30s

    return () => clearInterval(interval);
  }, [modoTrabalho, pausado]);

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
        // Preservar minutosRodados existentes ao reativar
        saveDailyRecord({
          ...todayRecord,
          modoTrabalhoAtivo: true,
          pausado: false,
          inicioTrabalho: Date.now(),
          tempoPausadoTotal: 0,
          // Não zerar minutosRodados - manter o acumulado
        });
      } else {
        saveDailyRecord({
          id: crypto.randomUUID(),
          date: today,
          kmRodados: 0,
          minutosRodados: 0,
          modoTrabalhoAtivo: true,
          pausado: false,
          inicioTrabalho: Date.now(),
          tempoPausadoTotal: 0,
        });
      }
      setKmPeriodo(todayRecord?.kmRodados || 0);
      setPausado(false);
    } else {
      // Desativar modo trabalho (finalizar)
      if (todayRecord && todayRecord.inicioTrabalho) {
        // Calcular minutos trabalhados nesta sessão
        const agora = Date.now();
        const tempoPausado = todayRecord.tempoPausadoTotal || 0;
        const diff = agora - todayRecord.inicioTrabalho - tempoPausado;
        const minutosNestaSessao = Math.floor(diff / (1000 * 60));
        
        // Somar com minutos já acumulados
        const minutosAcumulados = todayRecord.minutosRodados || 0;
        const minutosTotal = minutosAcumulados + minutosNestaSessao;
        
        saveDailyRecord({
          ...todayRecord,
          modoTrabalhoAtivo: false,
          pausado: false,
          minutosRodados: minutosTotal,
          inicioTrabalho: undefined,
          tempoPausadoTotal: 0,
        });
      }
      setTempoAtivo('');
      setPausado(false);
      atualizarDados();
    }
  };

  const togglePausa = () => {
    const novoPausado = !pausado;
    setPausado(novoPausado);

    const todayRecord = getTodayRecord();
    if (!todayRecord) return;

    if (novoPausado) {
      // Iniciar pausa
      saveDailyRecord({
        ...todayRecord,
        pausado: true,
        inicioPausa: Date.now(),
      });
    } else {
      // Retomar trabalho
      const tempoPausadoNestaPausa = todayRecord.inicioPausa 
        ? Date.now() - todayRecord.inicioPausa 
        : 0;
      
      saveDailyRecord({
        ...todayRecord,
        pausado: false,
        inicioPausa: undefined,
        tempoPausadoTotal: (todayRecord.tempoPausadoTotal || 0) + tempoPausadoNestaPausa,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 dark:from-slate-950 dark:via-orange-950/10 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Bike className="relative w-20 h-20 text-orange-600 dark:text-orange-500 animate-bounce mx-auto mb-6" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 dark:from-slate-950 dark:via-orange-950/10 dark:to-slate-900">
      <NotificationManager />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        {/* Header Premium com Logo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Logo Premium */}
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-2 sm:p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <Bike className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 dark:from-orange-400 dark:via-red-400 dark:to-orange-500 bg-clip-text text-transparent truncate">
                  Motoboy Cockpit
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate font-medium">
                  Olá, {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="transition-all duration-300 hover:scale-110 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 h-9 w-9 sm:h-10 sm:w-10 shadow-md"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:h-5 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* Alertas de Manutenção Premium */}
        {alertas.length > 0 && (
          <Card className="mb-4 sm:mb-6 border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 via-red-50/50 to-orange-50 dark:from-orange-950/30 dark:via-red-950/20 dark:to-orange-950/30 animate-in fade-in slide-in-from-top-2 duration-500 shadow-xl">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse drop-shadow-lg" />
                Alertas de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alertas.map((alerta, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl transition-all hover:scale-[1.02] duration-200 gap-2 shadow-md border border-orange-200 dark:border-orange-900"
                  >
                    <span className="font-semibold capitalize text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                      {alerta.tipo}
                    </span>
                    <Badge variant={alerta.urgente ? 'destructive' : 'secondary'} className="flex-shrink-0 text-xs shadow-sm">
                      {alerta.urgente
                        ? 'Urgente!'
                        : `${alerta.kmRestante.toFixed(0)} km`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modo Trabalho Premium */}
        <Card className={`mb-4 sm:mb-6 border-2 transition-all duration-500 shadow-2xl ${
          modoTrabalho 
            ? pausado
              ? 'border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 shadow-yellow-200/50 dark:shadow-yellow-900/30'
              : 'border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-green-950/40 shadow-green-200/50 dark:shadow-green-900/30 animate-in fade-in slide-in-from-top-3'
            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'
        }`}>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Controles principais */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div
                    className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-lg ${
                      modoTrabalho
                        ? pausado
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-300/50 dark:shadow-yellow-700/50 animate-pulse'
                          : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-300/50 dark:shadow-green-700/50 animate-pulse'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
                    }`}
                  >
                    {modoTrabalho ? (
                      pausado ? (
                        <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                      ) : (
                        <Square className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                      )
                    ) : (
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-lg sm:text-xl transition-colors duration-300 ${
                      modoTrabalho 
                        ? pausado
                          ? 'text-yellow-700 dark:text-yellow-400'
                          : 'text-green-700 dark:text-green-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      Modo Trabalho
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {modoTrabalho
                        ? pausado
                          ? 'Pausado - Retome quando quiser'
                          : 'Rastreando sua quilometragem'
                        : 'Inicie para registrar km'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {modoTrabalho && (
                    <Button
                      size="lg"
                      onClick={togglePausa}
                      className={`flex-1 sm:flex-initial transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold ${
                        pausado
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-300/50'
                          : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-yellow-300/50'
                      }`}
                    >
                      {pausado ? (
                        <>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Retomar
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Pausar
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="lg"
                    onClick={toggleModoTrabalho}
                    className={`flex-1 sm:flex-initial transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold ${
                      modoTrabalho
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-300/50'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-300/50'
                    }`}
                  >
                    {modoTrabalho ? (
                      <>
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Finalizar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Iniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Informações do período ativo */}
              {modoTrabalho && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-500 border border-green-200 dark:border-green-900">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl shadow-md border border-blue-200 dark:border-blue-900">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Rodando há</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {tempoAtivo || 'Calculando...'}
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl shadow-md border border-purple-200 dark:border-purple-900">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">KM neste período</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {kmPeriodo.toFixed(1)} km
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 animate-in fade-in duration-300 font-medium">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400">KM Hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {stats.kmHoje.toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">Gasto Hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                R$ {stats.gastoHoje.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-400">Gasto Total</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                R$ {stats.gastoMes.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-400">Tempo Trabalhado</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {Math.floor(stats.tempoTrabalhado / 60)}h {stats.tempoTrabalhado % 60}m
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Premium */}
        <Tabs defaultValue="abastecimento" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-gradient-to-r from-slate-200 via-orange-100 to-slate-200 dark:from-slate-800 dark:via-orange-950/50 dark:to-slate-800 shadow-lg rounded-xl">
            <TabsTrigger 
              value="abastecimento" 
              className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105 text-xs sm:text-base font-semibold rounded-lg"
            >
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Abastecimento</span>
              <span className="sm:hidden">Abast.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manutencao" 
              className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105 text-xs sm:text-base font-semibold rounded-lg"
            >
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Manutenção</span>
              <span className="sm:hidden">Manut.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105 text-xs sm:text-base font-semibold rounded-lg"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="minha-moto" 
              className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:scale-105 text-xs sm:text-base font-semibold rounded-lg"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Minha Moto</span>
              <span className="sm:hidden">Moto</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="abastecimento" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <AbastecimentoForm onSave={atualizarDados} />
          </TabsContent>

          <TabsContent value="manutencao" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <ManutencaoForm onSave={atualizarDados} />
          </TabsContent>

          <TabsContent value="historico" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <HistoricoView />
          </TabsContent>

          <TabsContent value="minha-moto" className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <MinhaMotoForm onSave={atualizarDados} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
