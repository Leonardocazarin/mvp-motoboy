"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Fuel, Wrench, TrendingUp } from 'lucide-react';
import { getDailyRecords, getAbastecimentos, getManutencoes } from '@/lib/storage';
import { DailyRecord, Abastecimento, Manutencao } from '@/lib/types';

export default function HistoricoView() {
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  useEffect(() => {
    setDailyRecords(getDailyRecords().sort((a, b) => b.date.localeCompare(a.date)));
    setAbastecimentos(getAbastecimentos().sort((a, b) => b.date.localeCompare(a.date)));
    setManutencoes(getManutencoes().sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calcularConsumo = (index: number): number | null => {
    if (index === abastecimentos.length - 1) return null;
    const atual = abastecimentos[index];
    const anterior = abastecimentos[index + 1];
    const kmPercorridos = atual.kmAtual - anterior.kmAtual;
    return kmPercorridos / atual.litros;
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Dias</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dailyRecords.length}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Abastecimentos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {abastecimentos.length}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Manutenções</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {manutencoes.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico Diário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico Diário
          </CardTitle>
          <CardDescription>Quilometragem registrada por dia</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRecords.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhum registro ainda. Ative o Modo Trabalho para começar!
            </p>
          ) : (
            <div className="space-y-3">
              {dailyRecords.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(record.date)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {record.kmRodados.toFixed(1)} km rodados
                    </p>
                  </div>
                  <Badge variant="secondary">{record.kmRodados.toFixed(1)} km</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Abastecimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            Abastecimentos
          </CardTitle>
          <CardDescription>Histórico de combustível e consumo</CardDescription>
        </CardHeader>
        <CardContent>
          {abastecimentos.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhum abastecimento registrado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {abastecimentos.slice(0, 10).map((abast, index) => {
                const consumo = calcularConsumo(index);
                return (
                  <div
                    key={abast.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(abast.date)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {abast.kmAtual.toFixed(0)} km
                        </p>
                      </div>
                      <Badge className="bg-green-600">R$ {abast.valorPago.toFixed(2)}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {abast.litros.toFixed(2)} litros
                      </span>
                      {consumo && (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {consumo.toFixed(1)} km/l
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Manutenções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Manutenções
          </CardTitle>
          <CardDescription>Serviços realizados na moto</CardDescription>
        </CardHeader>
        <CardContent>
          {manutencoes.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma manutenção registrada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {manutencoes.slice(0, 10).map((manut) => (
                <div
                  key={manut.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {manut.tipo}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(manut.date)} • {manut.kmRealizado.toFixed(0)} km
                      </p>
                    </div>
                    <Badge className="bg-orange-600">R$ {manut.valor.toFixed(2)}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {manut.descricao}
                  </p>
                  {manut.proximaManutencao && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Próxima: {manut.proximaManutencao.toFixed(0)} km
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
