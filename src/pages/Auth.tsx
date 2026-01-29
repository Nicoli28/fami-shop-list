import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Loader2, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberBiometric, setRememberBiometric] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { 
    isBiometricAvailable, 
    isBiometricRegistered, 
    isLoading: biometricLoading,
    registerBiometric,
    authenticateWithBiometric,
    getBiometricUserEmail
  } = useBiometricAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Pre-fill email if biometric is registered
  useEffect(() => {
    const savedEmail = getBiometricUserEmail();
    if (savedEmail && isBiometricRegistered) {
      setEmail(savedEmail);
    }
  }, [isBiometricRegistered, getBiometricUserEmail]);

  const handleBiometricLogin = async () => {
    const result = await authenticateWithBiometric();
    if (result.success) {
      toast.success('Bem-vindo de volta!');
      navigate('/');
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Erro na autenticação');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      setIsLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login: ' + error.message);
      }
    } else {
      // Register biometric if option selected and available
      if (rememberBiometric && isBiometricAvailable) {
        await registerBiometric(email, password);
      }
      setIsLoading(false);
      toast.success('Bem-vindo de volta!');
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      setIsLoading(false);
      if (error.message.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao criar conta: ' + error.message);
      }
    } else {
      // Register biometric if option selected and available
      if (rememberBiometric && isBiometricAvailable) {
        await registerBiometric(email, password);
      }
      setIsLoading(false);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Calculadora de Compras</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Organize suas compras e controle seus gastos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Biometric Login Button */}
          {isBiometricRegistered && isBiometricAvailable && (
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 text-base gap-3 border-primary/30 hover:border-primary hover:bg-primary/5"
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6 text-primary" />
                    <span>Entrar com Biometria</span>
                  </>
                )}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                {/* Biometric option */}
                {isBiometricAvailable && !isBiometricRegistered && (
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="biometric-login"
                      checked={rememberBiometric}
                      onCheckedChange={(checked) => setRememberBiometric(checked === true)}
                    />
                    <label
                      htmlFor="biometric-login"
                      className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
                    >
                      <Fingerprint className="w-4 h-4" />
                      Lembrar com biometria
                    </label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
                
                {/* Biometric option */}
                {isBiometricAvailable && (
                  <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id="biometric-signup"
                      checked={rememberBiometric}
                      onCheckedChange={(checked) => setRememberBiometric(checked === true)}
                    />
                    <label
                      htmlFor="biometric-signup"
                      className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
                    >
                      <Fingerprint className="w-4 h-4" />
                      Configurar biometria para próximos logins
                    </label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
