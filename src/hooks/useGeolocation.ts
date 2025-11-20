"use client";

import { useState, useEffect, useRef } from 'react';
import { calcularDistancia } from '@/lib/calculations';
import { addKm, getTodayRecord, saveDailyRecord } from '@/lib/storage';

export const useGeolocation = (isActive: boolean) => {
  const [kmRodados, setKmRodados] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
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

        // Apenas adicionar se a distância for significativa (> 50m) e razoável (< 5km)
        // Isso evita ruído de GPS e saltos irreais
        if (distancia > 0.05 && distancia < 5) {
          setKmRodados(prev => {
            const novoTotal = prev + distancia;
            
            // Atualizar storage
            addKm(distancia);
            
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = getTodayRecord();
            
            if (todayRecord) {
              saveDailyRecord({
                ...todayRecord,
                kmRodados: todayRecord.kmRodados + distancia,
              });
            } else {
              saveDailyRecord({
                id: crypto.randomUUID(),
                date: today,
                kmRodados: distancia,
                modoTrabalhoAtivo: true,
                inicioTrabalho: Date.now(),
              });
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
  }, [isActive]);

  return { kmRodados, error };
};
