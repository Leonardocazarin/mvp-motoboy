"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, Camera } from 'lucide-react';
import { saveAbastecimento } from '@/lib/storage';

interface AbastecimentoFormProps {
  onSave: () => void;
}

export default function AbastecimentoForm({ onSave }: AbastecimentoFormProps) {
  const [litros, setLitros] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  // Calcular preço por litro automaticamente
  const precoPorLitro = litros && valorTotal 
    ? (parseFloat(valorTotal) / parseFloat(litros)).toFixed(2)
    : '0.00';

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
    
    if (!litros || !valorTotal) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const litrosNum = parseFloat(litros);
    const valorNum = parseFloat(valorTotal);

    if (litrosNum <= 0 || valorNum <= 0) {
      alert('Valores devem ser maiores que zero');
      return;
    }

    saveAbastecimento({
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      litros: litrosNum,
      valorPago: valorNum,
      kmAtual: 0, // Não é mais necessário, mas mantido para compatibilidade
      fotoUrl: foto || undefined,
    });

    // Limpar formulário
    setLitros('');
    setValorTotal('');
    setFoto(null);
    
    onSave();
    alert('Abastecimento registrado com sucesso!');
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-950/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Fuel className="w-6 h-6" />
          Registrar Abastecimento
        </CardTitle>
        <CardDescription className="font-medium">
          Registre seu abastecimento para calcular consumo médio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="litros" className="text-sm sm:text-base font-semibold">Litros *</Label>
            <Input
              id="litros"
              type="number"
              step="0.01"
              placeholder="Ex: 5.5"
              value={litros}
              onChange={(e) => setLitros(e.target.value)}
              required
              className="text-base sm:text-lg h-12 border-2 focus:border-orange-500 dark:focus:border-orange-600 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm sm:text-base font-semibold">Valor Total (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="Ex: 30.50"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              required
              className="text-base sm:text-lg h-12 border-2 focus:border-orange-500 dark:focus:border-orange-600 transition-all shadow-sm"
            />
          </div>

          {/* Cálculo automático do preço por litro */}
          {litros && valorTotal && parseFloat(litros) > 0 && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-900 shadow-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Preço por Litro</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {precoPorLitro}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="foto" className="text-sm sm:text-base font-semibold">Foto do Comprovante (Opcional)</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('foto')?.click()}
                className="flex-1 h-12 border-2 hover:border-orange-500 dark:hover:border-orange-600 transition-all shadow-sm font-semibold"
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
              <div className="mt-3 relative rounded-xl overflow-hidden shadow-lg border-2 border-orange-200 dark:border-orange-900">
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
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <Fuel className="w-5 h-5 mr-2" />
            Registrar Abastecimento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
