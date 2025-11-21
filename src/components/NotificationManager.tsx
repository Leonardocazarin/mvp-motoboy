"use client";

import { useEffect } from 'react';
import { verificarAlertasManutencao } from '@/lib/calculations';

export function NotificationManager() {
  useEffect(() => {
    // Verificar alertas a cada 1 hora
    const checkAlerts = () => {
      const alertas = verificarAlertasManutencao();
      
      if ('Notification' in window && Notification.permission === 'granted') {
        alertas.forEach((alerta) => {
          // Notificar apenas alertas urgentes
          if (alerta.urgente) {
            new Notification('⚠️ Manutenção Urgente!', {
              body: `${alerta.tipo}: Manutenção necessária agora!`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: alerta.tipo,
              requireInteraction: true,
            });
          }
          // Notificar quando estiver próximo (menos de 200km)
          else if (alerta.kmRestante < 200) {
            new Notification('🔔 Manutenção Próxima', {
              body: `${alerta.tipo}: Faltam ${alerta.kmRestante.toFixed(0)} km`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: alerta.tipo,
            });
          }
        });
      }
    };

    // Verificar imediatamente
    checkAlerts();

    // Verificar a cada 1 hora
    const interval = setInterval(checkAlerts, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
