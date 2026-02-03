import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useReceipts } from '@/hooks/useReceipts';
import { toast } from 'sonner';

interface ScannedItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ScannedData {
  items: ScannedItem[];
  total_amount: number;
  market: string | null;
  payment_method: string | null;
  purchase_date: string | null;
}

interface ReceiptScannerViewProps {
  onReceiptSaved?: () => void;
}

export const ReceiptScannerView = ({ onReceiptSaved }: ReceiptScannerViewProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<ScannedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { createReceipt } = useReceipts();

  // Animate progress bar during processing
  useEffect(() => {
    if (!isProcessing) {
      setProcessingProgress(0);
      return;
    }

    const stages = [
      { progress: 15, stage: 'Preparando imagem...' },
      { progress: 35, stage: 'Enviando para análise...' },
      { progress: 55, stage: 'Analisando nota fiscal...' },
      { progress: 75, stage: 'Extraindo produtos...' },
      { progress: 90, stage: 'Finalizando...' },
    ];

    let currentStage = 0;
    setProcessingStage(stages[0].stage);
    setProcessingProgress(stages[0].progress);

    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        setProcessingProgress(stages[currentStage].progress);
        setProcessingStage(stages[currentStage].stage);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const processImage = async (base64Image: string) => {
    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStage('Iniciando...');
    
    try {
      console.log('Starting receipt scan...');
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { imageBase64: base64Image }
      });

      console.log('Scan response:', { data, error });

      if (error) {
        console.error('Error calling scan-receipt:', error);
        toast.error('Erro ao processar imagem. Tente novamente.');
        setPreviewImage(null);
        return;
      }

      if (data?.error) {
        console.error('Error from edge function:', data.error);
        toast.error(data.error);
        setPreviewImage(null);
        return;
      }

      if (data?.success && data?.data) {
        setProcessingProgress(100);
        setProcessingStage('Concluído!');
        
        // Small delay to show 100% before switching views
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setScannedData(data.data);
        setEditableData(data.data);
        toast.success(`Nota fiscal escaneada! ${data.data.items?.length || 0} itens encontrados.`);
      } else {
        console.error('Unexpected response format:', data);
        toast.error('Resposta inesperada do servidor. Tente novamente.');
        setPreviewImage(null);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      toast.error('Erro ao processar imagem. Verifique sua conexão.');
      setPreviewImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReceipt = async () => {
    if (!editableData) return;

    const title = editableData.market 
      ? `Compra - ${editableData.market}` 
      : `Compra escaneada - ${new Date().toLocaleDateString('pt-BR')}`;

    try {
      const result = await createReceipt(
        title,
        editableData.total_amount,
        editableData.payment_method || 'Não identificado',
        false,
        0,
        editableData.market || '',
        editableData.items
      );

      if (result) {
        resetScanner();
        // Notify parent to switch to receipts tab
        onReceiptSaved?.();
      }
    } catch (err) {
      console.error('Error saving receipt:', err);
      toast.error('Erro ao salvar nota fiscal. Tente novamente.');
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setEditableData(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const updateItem = (index: number, field: keyof ScannedItem, value: string | number) => {
    if (!editableData) return;
    
    const newItems = [...editableData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'name' ? value : Number(value) || 0
    };
    
    // Recalculate total_price if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    // Recalculate total
    const newTotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    
    setEditableData({
      ...editableData,
      items: newItems,
      total_amount: newTotal
    });
  };

  const removeItem = (index: number) => {
    if (!editableData) return;
    
    const newItems = editableData.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    
    setEditableData({
      ...editableData,
      items: newItems,
      total_amount: newTotal
    });
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Escanear Nota Fiscal</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tire uma foto ou selecione uma imagem da nota fiscal
        </p>
      </div>

      {!scannedData && !isProcessing && (
        <div className="space-y-4">
          {/* Camera capture */}
          <Card className="border-dashed border-2">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  size="lg"
                  className="w-full h-20 text-lg gap-3"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8" />
                  Tirar Foto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File upload */}
          <Card className="border-dashed border-2">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-20 text-lg gap-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8" />
                  Selecionar Imagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing state with progress bar */}
      {isProcessing && (
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-5">
              {previewImage && (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-40 rounded-lg object-contain opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full p-3">
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{processingStage}</span>
                  <span className="text-primary font-medium">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Analisando com IA...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanned results */}
      {editableData && !isProcessing && (
        <div className="space-y-4">
          {/* Preview image */}
          {previewImage && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={previewImage} 
                    alt="Nota fiscal" 
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Imagem escaneada</p>
                    <p className="text-sm text-muted-foreground">
                      {editableData.items.length} itens encontrados
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetScanner}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Store info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informações da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Mercado</Label>
                <Input
                  value={editableData.market || ''}
                  onChange={(e) => setEditableData({...editableData, market: e.target.value})}
                  placeholder="Nome do mercado"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Forma de Pagamento</Label>
                  <Input
                    value={editableData.payment_method || ''}
                    onChange={(e) => setEditableData({...editableData, payment_method: e.target.value})}
                    placeholder="Ex: Débito"
                  />
                </div>
                <div>
                  <Label className="text-xs">Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editableData.total_amount}
                    onChange={(e) => setEditableData({...editableData, total_amount: Number(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Itens ({editableData.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editableData.items.map((item, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="flex-1 text-sm"
                      placeholder="Nome do produto"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Qtd</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Preço Un.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.total_price.toFixed(2)}
                        readOnly
                        className="text-sm bg-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Total and actions */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Total da Compra</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {editableData.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetScanner}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSaveReceipt}>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar NF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
