// Types para o aplicativo de motoboys

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  kmRodados: number;
  minutosRodados: number; // Novo campo para tempo trabalhado
  modoTrabalhoAtivo: boolean;
  pausado: boolean; // Novo campo para controle de pausa
  inicioTrabalho?: number; // timestamp
  inicioPausa?: number; // timestamp da última pausa
  tempoPausadoTotal?: number; // tempo total pausado em ms
}

export interface Abastecimento {
  id: string;
  date: string;
  litros: number;
  valorPago: number;
  kmAtual: number;
  fotoUrl?: string;
}

export interface Manutencao {
  id: string;
  date: string;
  tipo: string;
  descricao: string;
  custo: number;
  kmAtual: number;
  proximaManutencaoKm?: number;
  fotoUrl?: string;
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
  tempoTrabalhado: number; // Novo campo para tempo total trabalhado em minutos
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cnh?: string;
  dataCadastro: string;
}

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cilindrada: number;
  cor?: string;
  kmAtual: number;
  capacidadeTanque?: number;
  tipoOleo?: string;
  observacoes?: string;
}
