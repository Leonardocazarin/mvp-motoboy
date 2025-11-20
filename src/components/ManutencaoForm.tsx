"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, CheckCircle2, Loader2 } from 'lucide-react';
import { saveManutencao, getKmTotal } from '@/lib/storage';
import { toast } from 'sonner';

interface ManutencaoFormProps {
  onSave: () => void;
}

const tiposManutencao = [
  { value: 'oleo', label: 'Troca de Óleo', intervalo: 3000 },
  { value: 'pastilhas', label: 'Pastilhas de Freio', intervalo: 10000 },
  { value: 'corrente', label: 'Corrente', intervalo: 5000 },
  { value: 'pneus', label: 'Pneus', intervalo: 15000 },
  { value: 'filtro', label: 'Filtro de Ar', intervalo: 5000 },
  { value: 'outro', label: 'Outro', intervalo: 0 },
];

export default function ManutencaoForm({ onSave }: ManutencaoFormProps) {
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valorNum = parseFloat(valor);

    if (!tipo || !descricao || isNaN(valorNum) || valorNum < 0) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }

    setSalvando(true);

    // Simular pequeno delay para animação
    await new Promise(resolve => setTimeout(resolve, 300));

    const kmAtual = getKmTotal();
    const tipoInfo = tiposManutencao.find(t => t.value === tipo);
    const proximaManutencao = tipoInfo?.intervalo ? kmAtual + tipoInfo.intervalo : undefined;

    const manutencao = {
      id: crypto.randomUUID(),
      tipo: tipo as any,
      descricao,
      date: new Date().toISOString().split('T')[0],
      kmRealizado: kmAtual,
      valor: valorNum,
      proximaManutencao,
    };

    saveManutencao(manutencao);
    
    // Animação de sucesso
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span>Manutenção registrada com sucesso!</span>
      </div>
    );
    
    setTipo('');
    setDescricao('');
    setValor('');
    setSalvando(false);
    onSave();
  };

  const tipoSelecionado = tiposManutencao.find(t => t.value === tipo);

  return (
    <Card className="transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-600" />
          Registrar Manutenção
        </CardTitle>
        <CardDescription>
          Anote serviços realizados e receba alertas automáticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Manutenção</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposManutencao.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Ex: Troca de óleo sintético 10W40"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="Ex: 150.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>KM Atual:</strong> {getKmTotal().toFixed(0)} km
            </p>
            {tipoSelecionado && tipoSelecionado.intervalo > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Próxima manutenção:</strong>{' '}
                {(getKmTotal() + tipoSelecionado.intervalo).toFixed(0)} km
                <span className="text-xs ml-1">
                  (em {tipoSelecionado.intervalo} km)
                </span>
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={salvando}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" />
                Registrar Manutenção
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
