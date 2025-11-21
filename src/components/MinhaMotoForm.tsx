"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bike, Save, Edit2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getVeiculo, saveVeiculo } from '@/lib/storage';
import { Veiculo } from '@/lib/types';
import { marcasMotos, obterRecomendacaoOleo, obterDadosModelo } from '@/lib/motoData';

interface MinhaMotoFormProps {
  onSave?: () => void;
}

export default function MinhaMotoForm({ onSave }: MinhaMotoFormProps) {
  const [editMode, setEditMode] = useState(false);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [modelosFiltrados, setModelosFiltrados] = useState<string[]>([]);
  const [recomendacaoOleo, setRecomendacaoOleo] = useState('');
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cilindrada: 160,
    cor: '',
    kmAtual: 0,
    capacidadeTanque: 0,
    tipoOleo: '',
    observacoes: '',
  });

  useEffect(() => {
    const veiculoSalvo = getVeiculo();
    if (veiculoSalvo) {
      setVeiculo(veiculoSalvo);
      setFormData({
        marca: veiculoSalvo.marca,
        modelo: veiculoSalvo.modelo,
        ano: veiculoSalvo.ano,
        cilindrada: veiculoSalvo.cilindrada,
        cor: veiculoSalvo.cor || '',
        kmAtual: veiculoSalvo.kmAtual,
        capacidadeTanque: (veiculoSalvo as any).capacidadeTanque || 0,
        tipoOleo: (veiculoSalvo as any).tipoOleo || '',
        observacoes: veiculoSalvo.observacoes || '',
      });
      setMarcaSelecionada(veiculoSalvo.marca);
      
      // Atualizar modelos filtrados
      const marca = marcasMotos.find(m => m.nome === veiculoSalvo.marca);
      if (marca) {
        setModelosFiltrados(marca.modelos.map(m => m.nome));
      }
      
      // Atualizar recomendação de óleo
      if (veiculoSalvo.marca && veiculoSalvo.modelo) {
        const recomendacao = obterRecomendacaoOleo(
          veiculoSalvo.marca,
          veiculoSalvo.modelo,
          veiculoSalvo.ano,
          veiculoSalvo.kmAtual
        );
        setRecomendacaoOleo(recomendacao);
      }
    } else {
      setEditMode(true);
    }
  }, []);

  // Atualizar modelos quando marca mudar
  useEffect(() => {
    if (marcaSelecionada) {
      const marca = marcasMotos.find(m => m.nome === marcaSelecionada);
      if (marca) {
        setModelosFiltrados(marca.modelos.map(m => m.nome));
      }
    } else {
      setModelosFiltrados([]);
    }
  }, [marcaSelecionada]);

  // Atualizar dados automáticos quando modelo mudar
  useEffect(() => {
    if (formData.marca && formData.modelo) {
      const dadosModelo = obterDadosModelo(formData.marca, formData.modelo);
      if (dadosModelo) {
        setFormData(prev => ({
          ...prev,
          cilindrada: dadosModelo.cilindrada,
          capacidadeTanque: dadosModelo.capacidadeTanque,
        }));
      }
      
      // Atualizar recomendação de óleo
      const recomendacao = obterRecomendacaoOleo(
        formData.marca,
        formData.modelo,
        formData.ano,
        formData.kmAtual
      );
      setRecomendacaoOleo(recomendacao);
      setFormData(prev => ({
        ...prev,
        tipoOleo: recomendacao,
      }));
    }
  }, [formData.marca, formData.modelo, formData.ano, formData.kmAtual]);

  const handleMarcaChange = (marca: string) => {
    setMarcaSelecionada(marca);
    setFormData({
      ...formData,
      marca,
      modelo: '', // Resetar modelo quando marca mudar
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.modelo) {
      toast.error('Preencha pelo menos o modelo');
      return;
    }

    if (!formData.kmAtual || formData.kmAtual <= 0) {
      toast.error('KM Atual é obrigatório e deve ser maior que zero');
      return;
    }

    const novoVeiculo: Veiculo & { capacidadeTanque: number; tipoOleo: string } = {
      id: veiculo?.id || crypto.randomUUID(),
      marca: formData.marca,
      modelo: formData.modelo,
      ano: formData.ano,
      placa: '', // Campo removido, mantido vazio para compatibilidade
      cilindrada: formData.cilindrada,
      cor: formData.cor,
      kmAtual: formData.kmAtual,
      capacidadeTanque: formData.capacidadeTanque,
      tipoOleo: formData.tipoOleo,
      observacoes: formData.observacoes,
    };

    saveVeiculo(novoVeiculo as any);
    setVeiculo(novoVeiculo as any);
    setEditMode(false);
    toast.success(veiculo ? 'Moto atualizada com sucesso!' : 'Moto cadastrada com sucesso!');
    onSave?.();
  };

  if (!editMode && veiculo) {
    return (
      <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Minha Moto</CardTitle>
                <CardDescription>Informações do seu veículo</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditMode(true)}
              className="hover:bg-orange-100 dark:hover:bg-orange-950"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Marca</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.marca || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Modelo</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.modelo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Ano</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.ano}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">KM Atual</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.kmAtual.toLocaleString()} km</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Cilindrada</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.cilindrada}cc</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Cor</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{veiculo.cor || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tanque</p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{(veiculo as any).capacidadeTanque || '-'} L</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tipo de Óleo Recomendado</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{(veiculo as any).tipoOleo || '-'}</p>
            </div>
            {veiculo.observacoes && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Observações</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{veiculo.observacoes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {veiculo ? 'Editar Minha Moto' : 'Cadastrar Minha Moto'}
            </CardTitle>
            <CardDescription>Preencha as informações do seu veículo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Select
                value={formData.marca}
                onValueChange={handleMarcaChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcasMotos.map((marca) => (
                    <SelectItem key={marca.nome} value={marca.nome}>
                      {marca.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Select
                value={formData.modelo}
                onValueChange={(value) => setFormData({ ...formData, modelo: value })}
                disabled={!marcaSelecionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder={marcaSelecionada ? "Selecione o modelo" : "Selecione a marca primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {modelosFiltrados.map((modelo) => (
                    <SelectItem key={modelo} value={modelo}>
                      {modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kmAtual">KM Atual *</Label>
              <Input
                id="kmAtual"
                type="number"
                min="0"
                value={formData.kmAtual}
                onChange={(e) => setFormData({ ...formData, kmAtual: parseFloat(e.target.value) || 0 })}
                required
                placeholder="Ex: 15000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cilindrada">Cilindrada (cc)</Label>
              <Input
                id="cilindrada"
                type="number"
                value={formData.cilindrada}
                onChange={(e) => setFormData({ ...formData, cilindrada: parseInt(e.target.value) || 0 })}
                disabled={!!formData.modelo}
                className={formData.modelo ? 'bg-gray-100 dark:bg-gray-800' : ''}
              />
              {formData.modelo && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Preenchido automaticamente
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                placeholder="Ex: Vermelha"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidadeTanque">Capacidade do Tanque (L)</Label>
              <Input
                id="capacidadeTanque"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ex: 16"
                value={formData.capacidadeTanque}
                onChange={(e) => setFormData({ ...formData, capacidadeTanque: parseFloat(e.target.value) || 0 })}
                disabled={!!formData.modelo}
                className={formData.modelo ? 'bg-gray-100 dark:bg-gray-800' : ''}
              />
              {formData.modelo && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Preenchido automaticamente
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tipoOleo" className="flex items-center gap-2">
                Tipo de Óleo Recomendado
                <Info className="w-4 h-4 text-blue-500" />
              </Label>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {recomendacaoOleo || 'Selecione marca, modelo e informe a quilometragem para ver a recomendação'}
                </p>
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Informações adicionais sobre sua moto"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {veiculo ? 'Atualizar' : 'Salvar'}
            </Button>
            {veiculo && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
