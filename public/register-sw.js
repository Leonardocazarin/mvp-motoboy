// Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // A cada 1 minuto
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  });

  // Detectar quando há uma nova versão disponível
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Nova versão do app disponível. Recarregando...');
    window.location.reload();
  });
}

// Detectar quando o app está pronto para ser instalado
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir o prompt automático
  e.preventDefault();
  // Guardar o evento para usar depois
  deferredPrompt = e;
  
  console.log('📱 App pronto para instalação!');
  
  // Mostrar banner de instalação customizado (opcional)
  showInstallPromotion();
});

// Função para mostrar promoção de instalação
function showInstallPromotion() {
  // Criar banner de instalação
  const installBanner = document.createElement('div');
  installBanner.id = 'install-banner';
  installBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 90%;
    animation: slideUp 0.3s ease-out;
  `;
  
  installBanner.innerHTML = `
    <span style="font-weight: 600; font-size: 14px;">📱 Instalar Motoboy Cockpit</span>
    <button id="install-button" style="
      background: white;
      color: #ea580c;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">Instalar</button>
    <button id="dismiss-button" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">Agora não</button>
  `;
  
  // Adicionar animação
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(installBanner);
  
  // Botão de instalar
  document.getElementById('install-button').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
      deferredPrompt = null;
    }
    installBanner.remove();
  });
  
  // Botão de dispensar
  document.getElementById('dismiss-button').addEventListener('click', () => {
    installBanner.remove();
  });
}

// Detectar quando o app foi instalado
window.addEventListener('appinstalled', () => {
  console.log('✅ App instalado com sucesso!');
  deferredPrompt = null;
  
  // Remover banner se existir
  const banner = document.getElementById('install-banner');
  if (banner) banner.remove();
});

// Detectar modo standalone (quando app está instalado)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('🚀 App rodando em modo standalone (instalado)');
}
