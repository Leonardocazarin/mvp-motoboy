"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, TrendingUp, Fuel, Wrench, Image as ImageIcon, X, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { getDailyRecords, getAbastecimentos, getManutencoes, deleteAbastecimento, deleteManutencao } from '@/lib/storage';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

// Função de formatação de data segura e otimizada
const formatDateSafe = (date: Date | string, format: 'full' | 'month' | 'day' = 'full'): string => {
  try {
    let d: Date;
    
    if (typeof date === 'string') {
      // Garantir que a data seja interpretada como UTC
      const [year, month, day] = date.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = date;
    }
    
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }

    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    if (format === 'full') {
      return `${day} de ${month} de ${year}`;
    } else if (format === 'month') {
      return `${month} de ${year}`;
    } else {
      return `${day} de ${month}`;
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

// Recomendações de próxima manutenção baseadas no tipo
const recomendacoesManutencao: Record<string, string> = {
  'Troca de Óleo': 'Recomenda-se trocar novamente em 1.000 km ou 1 mês',
  'Troca de Filtro': 'Recomenda-se trocar novamente em 2.000 km ou 2 meses',
  'Revisão Geral': 'Recomenda-se fazer novamente em 3.000 km ou 3 meses',
  'Troca de Pneu': 'Recomenda-se verificar novamente em 10.000 km ou quando apresentar desgaste',
  'Freios': 'Recomenda-se verificar novamente em 2.000 km ou quando sentir perda de eficiência',
  'Corrente': 'Recomenda-se lubrificar a cada 500 km e trocar em 15.000 km',
  'Velas': 'Recomenda-se trocar novamente em 5.000 km ou 6 meses',
  'Bateria': 'Recomenda-se verificar novamente em 6 meses ou quando apresentar problemas',
  'Outros': 'Consulte o manual da moto para recomendações específicas',
};

export default function HistoricoView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'abastecimento' | 'manutencao' | null;
    id: string | null;
  }>({
    open: false,
    type: null,
    id: null,
  });

  // Função para recarregar dados
  const reloadData = () => {
    try {
      setDailyRecords(getDailyRecords());
      setAbastecimentos(getAbastecimentos());
      setManutencoes(getManutencoes());
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar histórico. Tente recarregar a página.');
    }
  };

  // Garantir que o componente está montado (evita erros de hidratação)
  useEffect(() => {
    setMounted(true);
    reloadData();
  }, []);

  // Função para abrir dialog de confirmação
  const openConfirmDialog = (type: 'abastecimento' | 'manutencao', id: string) => {
    setConfirmDialog({
      open: true,
      type,
      id,
    });
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = () => {
    if (confirmDialog.type === 'abastecimento' && confirmDialog.id) {
      deleteAbastecimento(confirmDialog.id);
      toast.success('✅ Abastecimento apagado com sucesso!');
    } else if (confirmDialog.type === 'manutencao' && confirmDialog.id) {
      deleteManutencao(confirmDialog.id);
      toast.success('✅ Manutenção apagada com sucesso!');
    }
    
    reloadData();
    setConfirmDialog({ open: false, type: null, id: null });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrar dados por data selecionada
  const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
  const dailyData = dailyRecords.find(r => r.date === selectedDateStr);
  const dailyAbastecimentos = abastecimentos.filter(a => a.date && typeof a.date === 'string' && a.date === selectedDateStr);
  const dailyManutencoes = manutencoes.filter(m => m.date && typeof m.date === 'string' && m.date === selectedDateStr);

  // Dados mensais
  const selectedMonth = date ? date.toISOString().slice(0, 7) : '';
  const monthlyRecords = dailyRecords.filter(r => r.date && typeof r.date === 'string' && r.date.startsWith(selectedMonth));
  const monthlyAbastecimentos = abastecimentos.filter(a => a.date && typeof a.date === 'string' && a.date.startsWith(selectedMonth));
  const monthlyManutencoes = manutencoes.filter(m => m.date && typeof m.date === 'string' && m.date.startsWith(selectedMonth));

  const monthlyKm = monthlyRecords.reduce((sum, r) => sum + (r.kmRodados || 0), 0);
  const monthlyGasto = monthlyAbastecimentos.reduce((sum, a) => sum + a.valorPago, 0);
  const monthlyLitros = monthlyAbastecimentos.reduce((sum, a) => sum + a.litros, 0);

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="shadow-lg border-red-200 dark:border-red-900">
          <CardContent className="p-8">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="font-semibold mb-2">Erro ao carregar histórico</p>
              <p className="text-sm">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Seletor de Data e Modo */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Histórico
          </CardTitle>
          <CardDescription className="text-sm">
            Visualize seus registros diários ou mensais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {date ? formatDateSafe(date, 'full') : "Selecione uma data"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'daily' | 'monthly')} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily" className="text-sm sm:text-base">Diário</TabsTrigger>
                <TabsTrigger value="monthly" className="text-sm sm:text-base">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Visualização Diária */}
      {viewMode === 'daily' && (
        <div className="space-y-3 sm:space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">
                {date ? formatDateSafe(date, 'full') : 'Selecione uma data'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData || dailyAbastecimentos.length > 0 || dailyManutencoes.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumo do dia */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">KM Rodados</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {dailyData?.kmRodados?.toFixed(1) || '0.0'} km
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Abastecimentos</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {dailyAbastecimentos.length}
                      </p>
                    </div>
                  </div>

                  {/* Abastecimentos do dia */}
                  {dailyAbastecimentos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Fuel className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        Abastecimentos
                      </h4>
                      <div className="space-y-2">
                        {dailyAbastecimentos.map((a) => {
                          const precoPorLitro = a.litros > 0 ? (a.valorPago / a.litros).toFixed(2) : '0.00';
                          return (
                            <div key={a.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm sm:text-base">{a.litros.toFixed(2)}L</span>
                                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">
                                      R$ {a.valorPago.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    Preço por litro: R$ {precoPorLitro}
                                  </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  {a.fotoUrl && (
                                    <button
                                      onClick={() => setSelectedImage(a.fotoUrl!)}
                                      className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors active:scale-95"
                                    >
                                      <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openConfirmDialog('abastecimento', a.id)}
                                    className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                                    title="Apagar registro"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manutenções do dia */}
                  {dailyManutencoes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Manutenções
                      </h4>
                      <div className="space-y-2">
                        {dailyManutencoes.map((m) => {
                          const recomendacao = recomendacoesManutencao[m.tipo] || 'Consulte o manual da moto';
                          return (
                            <div key={m.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                              <div className="flex justify-between items-center gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium capitalize text-sm sm:text-base block truncate">{m.tipo}</span>
                                  {m.descricao && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                                      {m.descricao}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base">
                                    R$ {m.custo.toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => openConfirmDialog('manutencao', m.id)}
                                    className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                                    title="Apagar registro"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {m.kmAtual.toFixed(0)} km
                              </p>
                              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  {recomendacao}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
                  Nenhum registro encontrado para esta data
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualização Mensal */}
      {viewMode === 'monthly' && (
        <div className="space-y-3 sm:space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Resumo de {date ? formatDateSafe(date, 'month') : 'Selecione um mês'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRecords.length > 0 || monthlyAbastecimentos.length > 0 ? (
                <div className="space-y-4">
                  {/* Cards de resumo */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">KM Total</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {monthlyKm.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Gasto Total</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                        R$ {monthlyGasto.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Manutenções</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                        {monthlyManutencoes.length}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Abastecimentos</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {monthlyAbastecimentos.length}
                      </p>
                    </div>
                  </div>

                  {/* Lista de dias com atividade */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base">Dias com Atividade</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {monthlyRecords
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((record) => {
                          const dayAbast = abastecimentos.filter(a => a.date && typeof a.date === 'string' && a.date === record.date);
                          const dayManut = manutencoes.filter(m => m.date && typeof m.date === 'string' && m.date === record.date);
                          
                          return (
                            <div key={record.id} className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-lg border hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <span className="font-medium text-sm sm:text-base">
                                  {formatDateSafe(record.date, 'day')}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base flex-shrink-0">
                                  {record.kmRodados?.toFixed(1) || '0.0'} km
                                </span>
                              </div>
                              {(dayAbast.length > 0 || dayManut.length > 0) && (
                                <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  {dayAbast.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Fuel className="w-3 h-3" />
                                      {dayAbast.length} abast.
                                    </span>
                                  )}
                                  {dayManut.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Wrench className="w-3 h-3" />
                                      {dayManut.length} manut.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
                  Nenhum registro encontrado para este mês
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de imagem - Melhorado para mobile */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-10 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="overflow-auto rounded-lg">
              <img 
                src={selectedImage} 
                alt="Foto do abastecimento" 
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={handleConfirmDelete}
        title="Apagar registro?"
        description={
          confirmDialog.type === 'abastecimento'
            ? 'Tem certeza que deseja apagar este registro de abastecimento? Esta ação não pode ser desfeita.'
            : 'Tem certeza que deseja apagar este registro de manutenção? Esta ação não pode ser desfeita.'
        }
      />
    </div>
  );
}
