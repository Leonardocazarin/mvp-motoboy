"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bike, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getVeiculo, saveVeiculo } from '@/lib/storage';
import { Veiculo } from '@/lib/types';
import { toast } from 'sonner';

export default function CadastroVeiculoPage() {
  const [loading, setLoading] = useState(false);
  const [veiculo, setVeiculo] = useState<Partial<Veiculo>>({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    cilindrada: 125,
    cor: '',
    kmAtual: 0,
    observacoes: '',
  });

  useEffect(() => {
    const veiculoSalvo = getVeiculo();
    if (veiculoSalvo) {
      setVeiculo(veiculoSalvo);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const veiculoCompleto: Veiculo = {
      id: veiculo.id || crypto.randomUUID(),
      marca: veiculo.marca || '',
      modelo: veiculo.modelo || '',
      ano: veiculo.ano || new Date().getFullYear(),
      placa: veiculo.placa || '',
      cilindrada: veiculo.cilindrada || 125,
      cor: veiculo.cor,
      kmAtual: veiculo.kmAtual || 0,
      observacoes: veiculo.observacoes,
    };

    saveVeiculo(veiculoCompleto);
    
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span>Veículo salvo com sucesso!</span>
      </div>
    );
    
    setLoading(false);
  };

  const cilindradas = [50, 100, 125, 150, 160, 200, 250, 300, 400, 500, 600, 750, 1000, 1200];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="container mx-auto max-w-2xl py-6">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cadastro de Veículo</CardTitle>
                <CardDescription>
                  Registre as informações da sua moto
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    placeholder="Ex: Honda"
                    value={veiculo.marca}
                    onChange={(e) => setVeiculo({ ...veiculo, marca: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    placeholder="Ex: CG 160"
                    value={veiculo.modelo}
                    onChange={(e) => setVeiculo({ ...veiculo, modelo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano *</Label>
                  <Input
                    id="ano"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={veiculo.ano}
                    onChange={(e) => setVeiculo({ ...veiculo, ano: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    placeholder="ABC-1234"
                    value={veiculo.placa}
                    onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cilindrada">Cilindrada (cc) *</Label>
                  <Select
                    value={String(veiculo.cilindrada)}
                    onValueChange={(value) => setVeiculo({ ...veiculo, cilindrada: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {cilindradas.map((cc) => (
                        <SelectItem key={cc} value={String(cc)}>
                          {cc} cc
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    placeholder="Ex: Preta"
                    value={veiculo.cor || ''}
                    onChange={(e) => setVeiculo({ ...veiculo, cor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kmAtual">Quilometragem Atual *</Label>
                <Input
                  id="kmAtual"
                  type="number"
                  min="0"
                  placeholder="Ex: 15000"
                  value={veiculo.kmAtual}
                  onChange={(e) => setVeiculo({ ...veiculo, kmAtual: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre o veículo..."
                  value={veiculo.observacoes || ''}
                  onChange={(e) => setVeiculo({ ...veiculo, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Veículo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
