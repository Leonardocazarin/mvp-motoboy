"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Camera } from 'lucide-react';
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

export default function ManutencaoForm({ onSave }: ManutencaoFormProps) {
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [proximaManutencao, setProximaManutencao] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

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
    
    if (!tipo || !valor || !kmAtual) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    saveManutencao({
      id: crypto.randomUUID(),
      data: new Date().toISOString().split('T')[0],
      tipo: tipo,
      descricao: descricao,
      custo: parseFloat(valor),
      kmAtual: parseFloat(kmAtual),
      proximaManutencaoKm: proximaManutencao ? parseFloat(proximaManutencao) : undefined,
      fotoUrl: foto || undefined,
    });

    // Limpar formulário
    setTipo('');
    setDescricao('');
    setValor('');
    setKmAtual('');
    setProximaManutencao('');
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
            <Select value={tipo} onValueChange={setTipo} required>
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

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm sm:text-base font-semibold">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Detalhes da manutenção..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="text-base sm:text-lg min-h-[100px] border-2 focus:border-blue-500 dark:focus:border-blue-600 transition-all shadow-sm resize-none"
            />
          </div>

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
            <Label htmlFor="proxima" className="text-sm sm:text-base font-semibold">Próxima Manutenção (KM) - Opcional</Label>
            <Input
              id="proxima"
              type="number"
              step="0.1"
              placeholder="Ex: 16000"
              value={proximaManutencao}
              onChange={(e) => setProximaManutencao(e.target.value)}
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
