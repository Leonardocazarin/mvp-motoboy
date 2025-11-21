"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Camera, AlertCircle } from 'lucide-react';
import { saveManutencao } from '@/lib/storage';

interface ManutencaoFormProps {
  onSave: () => void;
}

const tiposManutencao = [
  'Troca de Óleo',
  'Troca de Filtro',
  'Revisão Geral',
  'Troca de Pneu',
  'Freios',
  'Corrente',
  'Velas',
  'Bateria',
  'Outros',
];

// Opções específicas para cada tipo de manutenção
const opcoesManutencao: Record<string, string[]> = {
  'Troca de Óleo': ['10W-30', '10W-40', '15W-40', '20W-50', 'Sintético 5W-40', 'Semi-sintético 10W-40'],
  'Troca de Filtro': ['Filtro de Óleo', 'Filtro de Ar', 'Filtro de Combustível'],
  'Revisão Geral': ['Revisão 1.000 km', 'Revisão 5.000 km', 'Revisão 10.000 km', 'Revisão 20.000 km'],
  'Troca de Pneu': ['Pneu Dianteiro', 'Pneu Traseiro', 'Ambos os Pneus'],
  'Freios': ['Freio Dianteiro', 'Freio Traseiro', 'Ambos os Freios', 'Pastilhas', 'Disco'],
  'Corrente': ['Lubrificação', 'Regulagem', 'Troca Completa (Kit Relação)'],
  'Velas': ['Vela Comum', 'Vela Iridium', 'Vela Platina'],
  'Bateria': ['Bateria 5Ah', 'Bateria 7Ah', 'Bateria 9Ah', 'Recarga'],
  'Outros': ['Especificar no campo de observações'],
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

export default function ManutencaoForm({ onSave }: ManutencaoFormProps) {
  const [tipo, setTipo] = useState('');
  const [opcaoEscolhida, setOpcaoEscolhida] = useState('');
  const [valor, setValor] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  // Obter recomendação automática baseada no tipo
  const recomendacao = tipo ? recomendacoesManutencao[tipo] : '';
  const opcoes = tipo ? opcoesManutencao[tipo] : [];

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipo || !opcaoEscolhida || !valor || !kmAtual) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const valorNum = parseFloat(valor);
    const kmNum = parseFloat(kmAtual);

    if (valorNum <= 0 || kmNum <= 0) {
      alert('Valores devem ser maiores que zero');
      return;
    }

    saveManutencao({
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      tipo: tipo,
      descricao: opcaoEscolhida, // Agora armazena a opção escolhida
      custo: valorNum,
      kmAtual: kmNum,
      proximaManutencaoKm: undefined,
      fotoUrl: foto || undefined,
    });

    // Limpar formulário
    setTipo('');
    setOpcaoEscolhida('');
    setValor('');
    setKmAtual('');
    setFoto(null);
    
    onSave();
    alert('Manutenção registrada com sucesso!');
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Wrench className="w-6 h-6" />
          Registrar Manutenção
        </CardTitle>
        <CardDescription className="font-medium">
          Mantenha o histórico de manutenções da sua moto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm sm:text-base font-semibold">Tipo de Manutenção *</Label>
            <Select value={tipo} onValueChange={(value) => {
              setTipo(value);
              setOpcaoEscolhida(''); // Limpa opção ao mudar tipo
            }} required>
              <SelectTrigger className="text-base sm:text-lg h-12 border-2 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposManutencao.map((t) => (
                  <SelectItem key={t} value={t} className="text-base">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opções específicas baseadas no tipo */}
          {tipo && opcoes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="opcao" className="text-sm sm:text-base font-semibold">
                {tipo === 'Troca de Óleo' ? 'Tipo de Óleo *' : 
                 tipo === 'Freios' ? 'Localização *' :
                 tipo === 'Troca de Pneu' ? 'Localização *' :
                 'Especificação *'}
              </Label>
              <Select value={opcaoEscolhida} onValueChange={setOpcaoEscolhida} required>
                <SelectTrigger className="text-base sm:text-lg h-12 border-2 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm">
                  <SelectValue placeholder="Selecione a opção" />
                </SelectTrigger>
                <SelectContent>
                  {opcoes.map((opcao) => (
                    <SelectItem key={opcao} value={opcao} className="text-base">
                      {opcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recomendação automática baseada no tipo */}
          {recomendacao && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-900 shadow-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    Próxima Manutenção
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {recomendacao}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm sm:text-base font-semibold">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="Ex: 150.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="text-base sm:text-lg h-12 border-2 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kmAtual" className="text-sm sm:text-base font-semibold">KM Atual *</Label>
            <Input
              id="kmAtual"
              type="number"
              step="0.1"
              placeholder="Ex: 15234.5"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              required
              className="text-base sm:text-lg h-12 border-2 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto" className="text-sm sm:text-base font-semibold">Foto do Serviço (Opcional)</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('foto')?.click()}
                className="flex-1 h-12 border-2 hover:border-blue-500 dark:hover:border-blue-600 transition-all shadow-sm font-semibold"
              >
                <Camera className="w-5 h-5 mr-2" />
                {foto ? 'Foto Anexada' : 'Anexar Foto'}
              </Button>
              <input
                id="foto"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>
            {foto && (
              <div className="mt-3 relative rounded-xl overflow-hidden shadow-lg border-2 border-blue-200 dark:border-blue-900">
                <img src={foto} alt="Preview" className="w-full h-48 object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setFoto(null)}
                  className="absolute top-2 right-2 shadow-xl"
                >
                  Remover
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <Wrench className="w-5 h-5 mr-2" />
            Registrar Manutenção
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
