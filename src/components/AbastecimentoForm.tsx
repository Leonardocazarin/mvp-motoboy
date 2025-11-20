"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Fuel, Camera, Image, Loader2, CheckCircle2 } from 'lucide-react';
import { saveAbastecimento, getKmTotal } from '@/lib/storage';
import { toast } from 'sonner';

interface AbastecimentoFormProps {
  onSave: () => void;
}

export default function AbastecimentoForm({ onSave }: AbastecimentoFormProps) {
  const [litros, setLitros] = useState('');
  const [valor, setValor] = useState('');
  const [processando, setProcessando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const litrosNum = parseFloat(litros);
    const valorNum = parseFloat(valor);

    if (isNaN(litrosNum) || isNaN(valorNum) || litrosNum <= 0 || valorNum <= 0) {
      toast.error('Por favor, preencha valores válidos');
      return;
    }

    setSalvando(true);

    // Simular pequeno delay para animação
    await new Promise(resolve => setTimeout(resolve, 300));

    const abastecimento = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      litros: litrosNum,
      valorPago: valorNum,
      kmAtual: getKmTotal(),
    };

    saveAbastecimento(abastecimento);
    
    // Animação de sucesso
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span>Abastecimento registrado!</span>
      </div>
    );
    
    setLitros('');
    setValor('');
    setSalvando(false);
    onSave();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const processarImagem = async (file: File) => {
    setProcessando(true);
    toast.info('Processando imagem da bomba...');

    try {
      // Importação dinâmica do Tesseract para evitar erros de SSR
      const Tesseract = (await import('tesseract.js')).default;
      
      const { data: { text } } = await Tesseract.recognize(file, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Opcional: mostrar progresso
          }
        },
      });

      // Extrair números do texto com melhor precisão
      const numeros = text.match(/\d+[.,]?\d*/g);
      
      if (!numeros || numeros.length < 2) {
        toast.error('Não consegui identificar os valores. Tente outra foto ou digite manualmente.');
        setProcessando(false);
        return;
      }

      // Heurística melhorada: geralmente litros é menor que valor total
      const valores = numeros
        .map(n => parseFloat(n.replace(',', '.')))
        .filter(n => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);

      if (valores.length >= 2) {
        // Litros geralmente entre 3 e 50
        const possiveisLitros = valores.filter(v => v >= 3 && v <= 50);
        // Valor geralmente maior que 20
        const possiveisValores = valores.filter(v => v >= 20);

        if (possiveisLitros.length > 0 && possiveisValores.length > 0) {
          setLitros(possiveisLitros[0].toFixed(2));
          setValor(possiveisValores[possiveisValores.length - 1].toFixed(2));
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Valores preenchidos automaticamente!</span>
            </div>
          );
        } else {
          toast.warning('Valores detectados, mas podem estar incorretos. Verifique antes de salvar.');
          if (valores.length >= 2) {
            setLitros(valores[0].toFixed(2));
            setValor(valores[valores.length - 1].toFixed(2));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem. Tente novamente ou digite manualmente.');
    } finally {
      setProcessando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processarImagem(file);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-orange-600" />
          Registrar Abastecimento
        </CardTitle>
        <CardDescription>
          Tire uma foto, selecione da galeria ou informe manualmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Botões de Foto */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={handleCameraClick}
              disabled={processando}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {processando ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Tirar Foto
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleGalleryClick}
              disabled={processando}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Image className="w-5 h-5 mr-2" />
              Selecionar da Galeria
            </Button>

            {/* Input para câmera */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Input para galeria */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-2 text-gray-500">
                ou preencha manualmente
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="litros">Litros</Label>
              <Input
                id="litros"
                type="number"
                step="0.01"
                placeholder="Ex: 15.5"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Pago (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="Ex: 85.50"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>KM Atual:</strong> {getKmTotal().toFixed(0)} km
            </p>
            {litros && valor && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Preço por litro:</strong> R${' '}
                {(parseFloat(valor) / parseFloat(litros)).toFixed(2)}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={salvando}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Fuel className="w-4 h-4 mr-2" />
                Registrar Abastecimento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
