"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingUp, Calendar, Wrench } from 'lucide-react';
import { getManutencoes, getVeiculo } from '@/lib/storage';
import { Manutencao } from '@/lib/types';

// Intervalos recomendados de manutenção (em km)
const intervalosManutencao: Record<string, number> = {
  'Troca de Óleo': 1000,
  'Troca de Filtro': 2000,
  'Revisão Geral': 3000,
  'Troca de Pneu': 10000,
  'Freios': 2000,
  'Corrente': 500,
  'Velas': 5000,
  'Bateria': 15000,
  'Outros': 5000,
};

interface AvisoManutencao {
  tipo: string;
  descricao?: string;
  ultimaTroca: {
    data: string;
    km: number;
  } | null;
  proximaTroca: {
    km: number;
    kmRestante: number;
  };
  urgente: boolean;
  vencido: boolean;
}

// Função de formatação de data
const formatDateSafe = (date: string): string => {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }

    const months = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];

    return `${day} de ${months[d.getMonth()]} de ${year}`;
  } catch (error) {
    return 'Data inválida';
  }
};

export default function AvisosView() {
  const [avisos, setAvisos] = useState<AvisoManutencao[]>([]);
  const [kmAtual, setKmAtual] = useState(0);

  useEffect(() => {
    carregarAvisos();
  }, []);

  const carregarAvisos = () => {
    const veiculo = getVeiculo();
    const manutencoes = getManutencoes();
    const kmAtualVeiculo = veiculo?.kmAtual || 0;
    setKmAtual(kmAtualVeiculo);

    // Agrupar manutenções por tipo
    const manutencoesPorTipo: Record<string, Manutencao[]> = {};
    
    manutencoes.forEach(m => {
      if (!manutencoesPorTipo[m.tipo]) {
        manutencoesPorTipo[m.tipo] = [];
      }
      manutencoesPorTipo[m.tipo].push(m);
    });

    // Criar avisos para cada tipo de manutenção
    const avisosGerados: AvisoManutencao[] = [];

    Object.keys(intervalosManutencao).forEach(tipo => {
      const manutencoesDoTipo = manutencoesPorTipo[tipo] || [];
      
      // Ordenar por KM (mais recente primeiro)
      manutencoesDoTipo.sort((a, b) => b.kmAtual - a.kmAtual);
      
      const ultimaManutencao = manutencoesDoTipo[0];
      const intervalo = intervalosManutencao[tipo];
      
      let proximoKm: number;
      let kmRestante: number;
      
      if (ultimaManutencao) {
        // Se já teve manutenção, calcular próxima baseada na última
        proximoKm = ultimaManutencao.kmAtual + intervalo;
        kmRestante = proximoKm - kmAtualVeiculo;
      } else {
        // Se nunca teve manutenção, usar KM atual + intervalo
        proximoKm = kmAtualVeiculo + intervalo;
        kmRestante = intervalo;
      }

      const vencido = kmRestante < 0;
      const urgente = kmRestante <= 100 && kmRestante >= 0;

      avisosGerados.push({
        tipo,
        descricao: ultimaManutencao?.descricao,
        ultimaTroca: ultimaManutencao ? {
          data: ultimaManutencao.date,
          km: ultimaManutencao.kmAtual,
        } : null,
        proximaTroca: {
          km: proximoKm,
          kmRestante,
        },
        urgente,
        vencido,
      });
    });

    // Ordenar: vencidos primeiro, depois urgentes, depois por km restante
    avisosGerados.sort((a, b) => {
      if (a.vencido && !b.vencido) return -1;
      if (!a.vencido && b.vencido) return 1;
      if (a.urgente && !b.urgente) return -1;
      if (!a.urgente && b.urgente) return 1;
      return a.proximaTroca.kmRestante - b.proximaTroca.kmRestante;
    });

    setAvisos(avisosGerados);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header com KM Atual */}
      <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Avisos de Manutenção</CardTitle>
                <CardDescription>Acompanhe suas manutenções programadas</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">KM Atual</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                {kmAtual.toFixed(0)}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Avisos */}
      <div className="space-y-3">
        {avisos.map((aviso, idx) => {
          const statusColor = aviso.vencido 
            ? 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40'
            : aviso.urgente
            ? 'border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/40 dark:to-orange-900/40'
            : 'border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30';

          const iconColor = aviso.vencido
            ? 'text-red-600 dark:text-red-400'
            : aviso.urgente
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-blue-600 dark:text-blue-400';

          return (
            <Card key={idx} className={`border-2 ${statusColor} shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]`}>
              <CardContent className="p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${aviso.vencido ? 'bg-red-200 dark:bg-red-900/50' : aviso.urgente ? 'bg-yellow-200 dark:bg-yellow-900/50' : 'bg-blue-200 dark:bg-blue-900/50'}`}>
                      <Wrench className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                        {aviso.tipo}
                      </h3>
                      {aviso.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {aviso.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={aviso.vencido ? 'destructive' : aviso.urgente ? 'default' : 'secondary'}
                    className="flex-shrink-0 shadow-sm"
                  >
                    {aviso.vencido 
                      ? 'Vencido!' 
                      : aviso.urgente 
                      ? 'Urgente' 
                      : 'Em dia'}
                  </Badge>
                </div>

                {/* Informações da Última Troca */}
                {aviso.ultimaTroca && (
                  <div className="mb-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Última Troca
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Data</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDateSafe(aviso.ultimaTroca.data)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">KM</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {aviso.ultimaTroca.km.toFixed(0)} km
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações da Próxima Troca */}
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Próxima Troca
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">KM Previsto</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {aviso.proximaTroca.km.toFixed(0)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <p className={`font-bold ${
                        aviso.vencido 
                          ? 'text-red-600 dark:text-red-400' 
                          : aviso.urgente 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {aviso.vencido 
                          ? `Vencido há ${Math.abs(aviso.proximaTroca.kmRestante).toFixed(0)} km`
                          : aviso.urgente
                          ? `Faltam ${aviso.proximaTroca.kmRestante.toFixed(0)} km`
                          : `Faltam ${aviso.proximaTroca.kmRestante.toFixed(0)} km`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensagem de Alerta */}
                {(aviso.vencido || aviso.urgente) && (
                  <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${
                    aviso.vencido 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                      aviso.vencido ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-yellow-600 dark:text-yellow-400'
                    }`} />
                    <p className={`text-xs font-medium ${
                      aviso.vencido ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {aviso.vencido 
                        ? 'Atenção! Esta manutenção está vencida. Realize o quanto antes.'
                        : 'Esta manutenção está próxima. Programe-se!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {avisos.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <p className="text-center text-gray-500 text-sm">
              Nenhum aviso de manutenção no momento. Registre suas manutenções para acompanhar!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
