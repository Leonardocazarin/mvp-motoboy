"use client";

import { useState, useEffect, useRef } from 'react';
import { calcularDistancia } from '@/lib/calculations';
import { addKm, getTodayRecord, saveDailyRecord, getVeiculo, saveVeiculo } from '@/lib/storage';

export const useGeolocation = (isActive: boolean, isPaused: boolean) => {
  const [kmRodados, setKmRodados] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Wake Lock para manter app ativo em segundo plano
  useEffect(() => {
    const requestWakeLock = async () => {
      // Verificar se Wake Lock está disponível e se o contexto permite
      if ('wakeLock' in navigator && isActive && !isPaused) {
        try {
          // Verificar se o documento está visível
          if (document.visibilityState === 'visible') {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            console.log('Wake Lock ativado');
          }
        } catch (err) {
          // Silenciosamente ignorar erro de Wake Lock (não é crítico)
          console.warn('Wake Lock não disponível:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock liberado');
        } catch (err) {
          console.warn('Erro ao liberar Wake Lock:', err);
        }
      }
    };

    // Reativar Wake Lock quando documento fica visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && !isPaused) {
        requestWakeLock();
      }
    };

    if (isActive && !isPaused) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    // Se pausado, não rastrear
    if (isPaused) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      lastPositionRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      if (lastPositionRef.current) {
        const distancia = calcularDistancia(
          lastPositionRef.current.lat,
          lastPositionRef.current.lon,
          latitude,
          longitude
        );

        // Apenas adicionar se a distância for significativa (> 10m) e razoável (< 1km por leitura)
        // Isso evita ruído de GPS e saltos irreais
        if (distancia > 0.01 && distancia < 1) {
          setKmRodados(prev => {
            const novoTotal = prev + distancia;
            
            // Atualizar KM Total global
            addKm(distancia);
            
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = getTodayRecord();
            
            // Atualizar registro do dia
            if (todayRecord) {
              const novoKmDia = (todayRecord.kmRodados || 0) + distancia;
              saveDailyRecord({
                ...todayRecord,
                kmRodados: novoKmDia,
              });
            } else {
              saveDailyRecord({
                id: crypto.randomUUID(),
                date: today,
                kmRodados: distancia,
                minutosRodados: 0,
                modoTrabalhoAtivo: true,
                pausado: false,
                inicioTrabalho: Date.now(),
                tempoPausadoTotal: 0,
              });
            }

            // Atualizar KM Atual do veículo SEMPRE
            const veiculo = getVeiculo();
            if (veiculo) {
              const novoKmVeiculo = (veiculo.kmAtual || 0) + distancia;
              saveVeiculo({
                ...veiculo,
                kmAtual: novoKmVeiculo,
              });
              console.log(`KM Veículo atualizado: ${novoKmVeiculo.toFixed(2)} km (+${distancia.toFixed(3)} km)`);
            }
            
            return novoTotal;
          });
        }
      }

      lastPositionRef.current = { lat: latitude, lon: longitude };
      setError(null);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError(`Erro ao obter localização: ${err.message}`);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isActive, isPaused]);

  return { kmRodados, error };
};
