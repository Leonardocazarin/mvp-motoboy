// Dados de marcas e modelos de motos brasileiras

export interface ModeloMoto {
  nome: string;
  cilindrada: number;
  capacidadeTanque: number;
  tipoOleoRecomendado: string;
  kmTrocaOleo: number; // KM recomendado para troca de óleo
  calibragemDianteira: number; // PSI
  calibragemTraseira: number; // PSI
}

export interface MarcaMoto {
  nome: string;
  modelos: ModeloMoto[];
}

export const marcasMotos: MarcaMoto[] = [
  {
    nome: 'Honda',
    modelos: [
      { nome: 'CG 160', cilindrada: 160, capacidadeTanque: 16, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'CG 160 Titan', cilindrada: 160, capacidadeTanque: 16, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'CG 160 Start', cilindrada: 160, capacidadeTanque: 16, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'CG 160 Fan', cilindrada: 160, capacidadeTanque: 16, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Biz 125', cilindrada: 125, capacidadeTanque: 5.5, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Pop 110i', cilindrada: 110, capacidadeTanque: 4.2, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Bros 160', cilindrada: 160, capacidadeTanque: 11, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'XRE 190', cilindrada: 190, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'CB 250F Twister', cilindrada: 250, capacidadeTanque: 16, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'CB 300F Twister', cilindrada: 300, capacidadeTanque: 16, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'CB 500X', cilindrada: 500, capacidadeTanque: 17.7, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
      { nome: 'PCX 160', cilindrada: 160, capacidadeTanque: 8.1, tipoOleoRecomendado: '10W-30', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
    ],
  },
  {
    nome: 'Yamaha',
    modelos: [
      { nome: 'Factor 150', cilindrada: 150, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Factor 125', cilindrada: 125, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Fazer 150', cilindrada: 150, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Fazer 250', cilindrada: 250, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'Crosser 150', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'Lander 250', cilindrada: 250, capacidadeTanque: 15, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'XTZ 150 Crosser', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'XTZ 250 Lander', cilindrada: 250, capacidadeTanque: 15, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'MT-03', cilindrada: 321, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
      { nome: 'Neo 125', cilindrada: 125, capacidadeTanque: 5.2, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Nmax 160', cilindrada: 160, capacidadeTanque: 7.1, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
    ],
  },
  {
    nome: 'Suzuki',
    modelos: [
      { nome: 'Intruder 150', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'GSX-S150', cilindrada: 150, capacidadeTanque: 11, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'V-Strom 250', cilindrada: 250, capacidadeTanque: 17, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'Burgman 125', cilindrada: 125, capacidadeTanque: 6, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'GSX-R750', cilindrada: 750, capacidadeTanque: 17, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
    ],
  },
  {
    nome: 'Kawasaki',
    modelos: [
      { nome: 'Ninja 400', cilindrada: 400, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
      { nome: 'Z400', cilindrada: 400, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
      { nome: 'Versys 300', cilindrada: 300, capacidadeTanque: 17, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'Ninja 650', cilindrada: 650, capacidadeTanque: 15, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
      { nome: 'Z650', cilindrada: 650, capacidadeTanque: 15, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
    ],
  },
  {
    nome: 'Dafra',
    modelos: [
      { nome: 'Apache 200', cilindrada: 200, capacidadeTanque: 16, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'NH 190', cilindrada: 190, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Citycom 300i', cilindrada: 300, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'Maxsym 400i', cilindrada: 400, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 33, calibragemTraseira: 36 },
    ],
  },
  {
    nome: 'Shineray',
    modelos: [
      { nome: 'Jet 50', cilindrada: 50, capacidadeTanque: 4.5, tipoOleoRecomendado: '15W-40', kmTrocaOleo: 800, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Phoenix 50', cilindrada: 50, capacidadeTanque: 4, tipoOleoRecomendado: '15W-40', kmTrocaOleo: 800, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'Retro 50', cilindrada: 50, capacidadeTanque: 5, tipoOleoRecomendado: '15W-40', kmTrocaOleo: 800, calibragemDianteira: 25, calibragemTraseira: 28 },
      { nome: 'XY 150-10', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
    ],
  },
  {
    nome: 'Haojue',
    modelos: [
      { nome: 'DK 150', cilindrada: 150, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'NK 150', cilindrada: 150, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Chopper Road 150', cilindrada: 150, capacidadeTanque: 13, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
    ],
  },
  {
    nome: 'Traxx',
    modelos: [
      { nome: 'JH 150', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'JH 200', cilindrada: 200, capacidadeTanque: 14, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'TS 150', cilindrada: 150, capacidadeTanque: 12, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
    ],
  },
  {
    nome: 'Royal Enfield',
    modelos: [
      { nome: 'Himalayan 411', cilindrada: 411, capacidadeTanque: 15, tipoOleoRecomendado: '10W-50', kmTrocaOleo: 1000, calibragemDianteira: 21, calibragemTraseira: 25 },
      { nome: 'Meteor 350', cilindrada: 350, capacidadeTanque: 15, tipoOleoRecomendado: '10W-50', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
      { nome: 'Classic 350', cilindrada: 350, capacidadeTanque: 13.5, tipoOleoRecomendado: '10W-50', kmTrocaOleo: 1000, calibragemDianteira: 28, calibragemTraseira: 32 },
    ],
  },
  {
    nome: 'BMW',
    modelos: [
      { nome: 'G 310 GS', cilindrada: 310, capacidadeTanque: 11, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'G 310 R', cilindrada: 310, capacidadeTanque: 11, tipoOleoRecomendado: '10W-40', kmTrocaOleo: 1000, calibragemDianteira: 29, calibragemTraseira: 33 },
      { nome: 'F 850 GS', cilindrada: 850, capacidadeTanque: 15, tipoOleoRecomendado: '5W-40', kmTrocaOleo: 1000, calibragemDianteira: 36, calibragemTraseira: 42 },
    ],
  },
];

// Função para obter recomendação de óleo baseada em modelo, ano e km
export const obterRecomendacaoOleo = (
  marca: string,
  modelo: string,
  ano: number,
  kmAtual: number
): string => {
  const marcaEncontrada = marcasMotos.find(m => m.nome === marca);
  if (!marcaEncontrada) return '10W-40'; // Padrão

  const modeloEncontrado = marcaEncontrada.modelos.find(m => m.nome === modelo);
  if (!modeloEncontrado) return '10W-40'; // Padrão

  // Lógica de recomendação baseada em idade e quilometragem
  const idadeMoto = new Date().getFullYear() - ano;
  
  // Motos mais antigas (>10 anos) ou com alta quilometragem (>50.000 km)
  if (idadeMoto > 10 || kmAtual > 50000) {
    // Óleo mais viscoso para compensar desgaste
    if (modeloEncontrado.tipoOleoRecomendado === '10W-30') {
      return '10W-40 (recomendado para motos com mais desgaste)';
    }
    if (modeloEncontrado.tipoOleoRecomendado === '10W-40') {
      return '15W-40 (recomendado para motos com mais desgaste)';
    }
  }

  // Motos novas ou com baixa quilometragem
  if (idadeMoto <= 3 && kmAtual < 20000) {
    return `${modeloEncontrado.tipoOleoRecomendado} (sintético recomendado para melhor proteção)`;
  }

  // Padrão do modelo
  return `${modeloEncontrado.tipoOleoRecomendado} (recomendado pelo fabricante)`;
};

// Função para obter recomendação de calibragem de pneus baseada em modelo e ano
export const obterRecomendacaoCalibragem = (
  marca: string,
  modelo: string,
  ano: number
): string => {
  const marcaEncontrada = marcasMotos.find(m => m.nome === marca);
  if (!marcaEncontrada) return 'Dianteiro: 28 PSI | Traseiro: 32 PSI'; // Padrão

  const modeloEncontrado = marcaEncontrada.modelos.find(m => m.nome === modelo);
  if (!modeloEncontrado) return 'Dianteiro: 28 PSI | Traseiro: 32 PSI'; // Padrão

  const idadeMoto = new Date().getFullYear() - ano;
  
  // Ajuste para motos mais antigas (pneus podem precisar de calibragem ligeiramente maior)
  const ajuste = idadeMoto > 10 ? 2 : 0;
  
  return `Dianteiro: ${modeloEncontrado.calibragemDianteira + ajuste} PSI | Traseiro: ${modeloEncontrado.calibragemTraseira + ajuste} PSI`;
};

// Função para obter dados completos do modelo
export const obterDadosModelo = (marca: string, modelo: string): ModeloMoto | null => {
  const marcaEncontrada = marcasMotos.find(m => m.nome === marca);
  if (!marcaEncontrada) return null;

  return marcaEncontrada.modelos.find(m => m.nome === modelo) || null;
};
