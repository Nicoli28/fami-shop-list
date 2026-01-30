import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, Check, X, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWA = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-6">
        <div className="bg-card rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">App Instalado!</h1>
          <p className="text-muted-foreground">
            O Fami Shop List já está instalado no seu dispositivo. Você pode acessá-lo pela tela inicial.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Ir para o App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-6">
      <div className="bg-card rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Instalar App</h1>
          <p className="text-muted-foreground">
            Instale o Fami Shop List no seu celular para acesso rápido e offline!
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Acesso rápido</p>
              <p className="text-xs text-muted-foreground">Abra direto da tela inicial</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Funciona offline</p>
              <p className="text-xs text-muted-foreground">Use mesmo sem internet</p>
            </div>
          </div>
        </div>

        {isIOS && !deferredPrompt ? (
          <div className="space-y-3">
            <Button onClick={() => setShowIOSInstructions(true)} className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Como instalar no iPhone
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Continuar no navegador
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-3">
            <Button onClick={handleInstallClick} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Instalar Agora
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Continuar no navegador
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Se o botão de instalação não aparecer, use o menu do navegador → "Adicionar à tela inicial"
            </p>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Continuar no navegador
            </Button>
          </div>
        )}
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full space-y-4 relative animate-slide-up">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-foreground">Instalar no iPhone/iPad</h2>
            
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Toque no botão <Share className="w-4 h-4 inline-block mx-1" /> Compartilhar na barra do Safari</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Role para baixo e toque em "Adicionar à Tela de Início"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Toque em "Adicionar" no canto superior direito</span>
              </li>
            </ol>
            
            <Button onClick={() => setShowIOSInstructions(false)} className="w-full">
              Entendi!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallPWA;
