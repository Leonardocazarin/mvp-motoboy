// Cálculos e estatísticas do aplicativo

import { getDailyRecords, getAbastecimentos, getManutencoes, getKmTotal, getVeiculo } from './storage';
import { Estatisticas, AlertaManutencao } from './types';

export const obterEstatisticas = (): Estatisticas => {
  const today = new Date().toISOString().split('T')[0];
  const dailyRecords = getDailyRecords();
  const abastecimentos = getAbastecimentos();
  const manutencoes = getManutencoes();

  // KM Hoje
  const todayRecord = dailyRecords.find(r => r.date === today);
  const kmHoje = todayRecord?.kmRodados || 0;

  // KM Total
  const kmTotal = getKmTotal();

  // Tempo Trabalhado Total (soma de todos os dias)
  const tempoTrabalhado = dailyRecords.reduce((total, record) => {
    return total + (record.minutosRodados || 0);
  }, 0);

  // Consumo Médio (últimos 5 abastecimentos)
  let consumoMedio = 0;
  if (abastecimentos.length >= 2) {
    const ultimos = abastecimentos.slice(-5);
    let totalKm = 0;
    let totalLitros = 0;
    
    for (let i = 1; i < ultimos.length; i++) {
      const kmPercorrido = ultimos[i].kmAtual - ultimos[i - 1].kmAtual;
      totalKm += kmPercorrido;
      totalLitros += ultimos[i].litros;
    }
    
    if (totalLitros > 0) {
      consumoMedio = totalKm / totalLitros;
    }
  }

  // Gasto Hoje
  const abastecimentosHoje = abastecimentos.filter(a => a.date === today);
  const manutencoesHoje = manutencoes.filter(m => m.date === today);
  const gastoHoje = 
    abastecimentosHoje.reduce((sum, a) => sum + a.valorPago, 0) +
    manutencoesHoje.reduce((sum, m) => sum + m.custo, 0);

  // Gasto Total (Mês atual)
  const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM
  const abastecimentosMes = abastecimentos.filter(a => a.date.startsWith(mesAtual));
  const manutencoesMes = manutencoes.filter(m => m.date.startsWith(mesAtual));
  const gastoMes = 
    abastecimentosMes.reduce((sum, a) => sum + a.valorPago, 0) +
    manutencoesMes.reduce((sum, m) => sum + m.custo, 0);

  return {
    kmHoje,
    consumoMedio,
    gastoHoje,
    gastoMes,
    kmTotal,
    tempoTrabalhado,
  };
};

// Intervalos recomendados de manutenção (em km)
const INTERVALOS_MANUTENCAO: Record<string, number> = {
  'troca de óleo': 1000,
  'filtro de óleo': 1000,
  'filtro de ar': 2000,
  'velas': 5000,
  'corrente': 500,
  'freio dianteiro': 2000,
  'freio traseiro': 2000,
  'pneu dianteiro': 10000,
  'pneu traseiro': 10000,
  'bateria': 20000,
  'revisão geral': 3000,
  'troca de filtro': 2000,
  'freios': 2000,
  'troca de pneu': 10000,
};

export const verificarAlertasManutencao = (): AlertaManutencao[] => {
  const manutencoes = getManutencoes();
  const veiculo = getVeiculo();
  const kmAtual = veiculo?.kmAtual || getKmTotal();
  const alertas: AlertaManutencao[] = [];

  // Agrupar manutenções por tipo e pegar a mais recente de cada
  const manutencoesPorTipo = new Map<string, number>();
  
  manutencoes.forEach(m => {
    const tipoLower = m.tipo.toLowerCase();
    const kmManutencao = m.kmAtual;
    
    if (!manutencoesPorTipo.has(tipoLower) || kmManutencao > manutencoesPorTipo.get(tipoLower)!) {
      manutencoesPorTipo.set(tipoLower, kmManutencao);
    }
  });

  // Verificar cada tipo de manutenção
  Object.entries(INTERVALOS_MANUTENCAO).forEach(([tipo, intervalo]) => {
    const ultimaManutencaoKm = manutencoesPorTipo.get(tipo) || 0;
    const kmDesdeUltimaManutencao = kmAtual - ultimaManutencaoKm;
    const kmRestante = intervalo - kmDesdeUltimaManutencao;

    // Alertar se faltam menos de 500km ou já passou do prazo
    if (kmRestante <= 500) {
      alertas.push({
        tipo,
        kmRestante: Math.max(0, kmRestante),
        urgente: kmRestante <= 0,
      });
    }
  });

  // Ordenar por urgência (urgentes primeiro, depois por km restante)
  return alertas.sort((a, b) => {
    if (a.urgente && !b.urgente) return -1;
    if (!a.urgente && b.urgente) return 1;
    return a.kmRestante - b.kmRestante;
  });
};

export const calcularProximaManutencao = (tipo: string, kmAtual: number): number => {
  const tipoLower = tipo.toLowerCase();
  const intervalo = INTERVALOS_MANUTENCAO[tipoLower] || 5000;
  return kmAtual + intervalo;
};

export const obterIntervaloManutencao = (tipo: string): number => {
  const tipoLower = tipo.toLowerCase();
  return INTERVALOS_MANUTENCAO[tipoLower] || 5000;
};

// Calcula distância entre duas coordenadas geográficas usando fórmula de Haversine
export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
};
