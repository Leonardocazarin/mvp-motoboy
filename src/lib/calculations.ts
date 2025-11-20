// Cálculos e lógica de negócio

import { Abastecimento, Manutencao, AlertaManutencao, Estatisticas } from './types';
import { getDailyRecords, getAbastecimentos, getManutencoes, getKmTotal } from './storage';

// Calcular consumo médio (km/l)
export const calcularConsumoMedio = (): number => {
  const abastecimentos = getAbastecimentos();
  if (abastecimentos.length < 2) return 0;

  // Pegar últimos 5 abastecimentos para média mais precisa
  const ultimos = abastecimentos.slice(-5);
  let totalKm = 0;
  let totalLitros = 0;

  for (let i = 1; i < ultimos.length; i++) {
    const kmPercorridos = ultimos[i].kmAtual - ultimos[i - 1].kmAtual;
    totalKm += kmPercorridos;
    totalLitros += ultimos[i].litros;
  }

  return totalLitros > 0 ? totalKm / totalLitros : 0;
};

// Calcular gastos do dia
export const calcularGastosHoje = (): number => {
  const hoje = new Date().toISOString().split('T')[0];
  const abastecimentos = getAbastecimentos().filter(a => a.date === hoje);
  const manutencoes = getManutencoes().filter(m => m.date === hoje);

  const gastoAbastecimento = abastecimentos.reduce((sum, a) => sum + a.valorPago, 0);
  const gastoManutencao = manutencoes.reduce((sum, m) => sum + m.valor, 0);

  return gastoAbastecimento + gastoManutencao;
};

// Calcular gastos do mês
export const calcularGastosMes = (): number => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const abastecimentos = getAbastecimentos().filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === mesAtual && date.getFullYear() === anoAtual;
  });

  const manutencoes = getManutencoes().filter(m => {
    const date = new Date(m.date);
    return date.getMonth() === mesAtual && date.getFullYear() === anoAtual;
  });

  const gastoAbastecimento = abastecimentos.reduce((sum, a) => sum + a.valorPago, 0);
  const gastoManutencao = manutencoes.reduce((sum, m) => sum + m.valor, 0);

  return gastoAbastecimento + gastoManutencao;
};

// Calcular km rodados hoje
export const calcularKmHoje = (): number => {
  const hoje = new Date().toISOString().split('T')[0];
  const records = getDailyRecords();
  const todayRecord = records.find(r => r.date === hoje);
  return todayRecord?.kmRodados || 0;
};

// Obter estatísticas completas
export const obterEstatisticas = (): Estatisticas => {
  return {
    kmHoje: calcularKmHoje(),
    consumoMedio: calcularConsumoMedio(),
    gastoHoje: calcularGastosHoje(),
    gastoMes: calcularGastosMes(),
    kmTotal: getKmTotal(),
  };
};

// Verificar alertas de manutenção
export const verificarAlertasManutencao = (): AlertaManutencao[] => {
  const manutencoes = getManutencoes();
  const kmAtual = getKmTotal();
  const alertas: AlertaManutencao[] = [];

  // Intervalos recomendados (em km)
  const intervalos: Record<string, number> = {
    oleo: 3000,
    pastilhas: 10000,
    corrente: 5000,
    pneus: 15000,
    filtro: 5000,
  };

  Object.entries(intervalos).forEach(([tipo, intervalo]) => {
    const ultimaManutencao = manutencoes
      .filter(m => m.tipo === tipo)
      .sort((a, b) => b.kmRealizado - a.kmRealizado)[0];

    if (ultimaManutencao) {
      const kmDesdeUltima = kmAtual - ultimaManutencao.kmRealizado;
      const kmRestante = intervalo - kmDesdeUltima;

      if (kmRestante <= 500) {
        alertas.push({
          tipo,
          kmRestante: Math.max(0, kmRestante),
          urgente: kmRestante <= 0,
        });
      }
    } else {
      // Primeira manutenção - alerta após 80% do intervalo
      if (kmAtual >= intervalo * 0.8) {
        alertas.push({
          tipo,
          kmRestante: intervalo - kmAtual,
          urgente: kmAtual >= intervalo,
        });
      }
    }
  });

  return alertas;
};

// Calcular distância entre duas coordenadas (fórmula de Haversine)
export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
