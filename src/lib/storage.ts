// Gerenciamento de Local Storage

import { DailyRecord, Abastecimento, Manutencao, Usuario, Veiculo } from './types';

const KEYS = {
  DAILY_RECORDS: 'motoboy_daily_records',
  ABASTECIMENTOS: 'motoboy_abastecimentos',
  MANUTENCOES: 'motoboy_manutencoes',
  KM_TOTAL: 'motoboy_km_total',
  USUARIO: 'motoboy_usuario',
  VEICULO: 'motoboy_veiculo',
};

// Daily Records
export const getDailyRecords = (): DailyRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.DAILY_RECORDS);
  return data ? JSON.parse(data) : [];
};

export const saveDailyRecord = (record: DailyRecord) => {
  const records = getDailyRecords();
  const index = records.findIndex(r => r.date === record.date);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(records));
};

export const getTodayRecord = (): DailyRecord | null => {
  const today = new Date().toISOString().split('T')[0];
  const records = getDailyRecords();
  return records.find(r => r.date === today) || null;
};

// Abastecimentos
export const getAbastecimentos = (): Abastecimento[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.ABASTECIMENTOS);
  return data ? JSON.parse(data) : [];
};

export const saveAbastecimento = (abastecimento: Abastecimento) => {
  const abastecimentos = getAbastecimentos();
  abastecimentos.push(abastecimento);
  localStorage.setItem(KEYS.ABASTECIMENTOS, JSON.stringify(abastecimentos));
};

// Manutenções
export const getManutencoes = (): Manutencao[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.MANUTENCOES);
  return data ? JSON.parse(data) : [];
};

export const saveManutencao = (manutencao: Manutencao) => {
  const manutencoes = getManutencoes();
  manutencoes.push(manutencao);
  localStorage.setItem(KEYS.MANUTENCOES, JSON.stringify(manutencoes));
};

// KM Total
export const getKmTotal = (): number => {
  if (typeof window === 'undefined') return 0;
  const data = localStorage.getItem(KEYS.KM_TOTAL);
  return data ? parseFloat(data) : 0;
};

export const setKmTotal = (km: number) => {
  localStorage.setItem(KEYS.KM_TOTAL, km.toString());
};

export const addKm = (km: number) => {
  const total = getKmTotal();
  setKmTotal(total + km);
};

// Usuário
export const getUsuario = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.USUARIO);
  return data ? JSON.parse(data) : null;
};

export const saveUsuario = (usuario: Usuario) => {
  localStorage.setItem(KEYS.USUARIO, JSON.stringify(usuario));
};

// Veículo
export const getVeiculo = (): Veiculo | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.VEICULO);
  return data ? JSON.parse(data) : null;
};

export const saveVeiculo = (veiculo: Veiculo) => {
  localStorage.setItem(KEYS.VEICULO, JSON.stringify(veiculo));
};
