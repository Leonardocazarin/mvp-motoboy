// Types para o aplicativo de motoboys

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  kmRodados: number;
  modoTrabalhoAtivo: boolean;
  inicioTrabalho?: number; // timestamp
}

export interface Abastecimento {
  id: string;
  date: string;
  litros: number;
  valorPago: number;
  kmAtual: number;
}

export interface Manutencao {
  id: string;
  tipo: 'oleo' | 'pastilhas' | 'corrente' | 'pneus' | 'filtro' | 'outro';
  descricao: string;
  date: string;
  kmRealizado: number;
  valor: number;
  proximaManutencao?: number; // km para próxima manutenção
}

export interface AlertaManutencao {
  tipo: string;
  kmRestante: number;
  urgente: boolean;
}

export interface Estatisticas {
  kmHoje: number;
  consumoMedio: number; // km/l
  gastoHoje: number;
  gastoMes: number;
  kmTotal: number;
}
