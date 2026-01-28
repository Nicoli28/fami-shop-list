import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingItem, PriceHistory } from '@/types/shopping';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { History } from 'lucide-react';

interface PriceDialogProps {
  item: ShoppingItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (itemId: string, price: number, market?: string) => void;
}

export const PriceDialog = ({ item, open, onClose, onSave }: PriceDialogProps) => {
  const [price, setPrice] = useState('');
  const [market, setMarket] = useState('');
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const { getItemPriceHistory } = usePriceHistory();

  useEffect(() => {
    if (item && open) {
      setPrice(item.unit_price?.toString() || '');
      setMarket(item.market || '');
      loadHistory();
    }
  }, [item, open]);

  const loadHistory = async () => {
    if (item) {
      const h = await getItemPriceHistory(item.name);
      setHistory(h);
    }
  };

  const handleSave = () => {
    if (item && price) {
      onSave(item.id, parseFloat(price), market);
      onClose();
    }
  };

  const selectHistoricalPrice = (historyItem: PriceHistory) => {
    setPrice(historyItem.unit_price.toString());
    if (historyItem.market) {
      setMarket(historyItem.market);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Informar Preço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Valor unitário (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market">Mercado (opcional)</Label>
            <Input
              id="market"
              placeholder="Ex: Supermercado X"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="h-12"
            />
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Preços anteriores
              </Label>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 5).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => selectHistoricalPrice(h)}
                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors"
                  >
                    R$ {h.unit_price.toFixed(2)}
                    {h.market && <span className="text-xs text-muted-foreground ml-1">({h.market})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {price && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total deste item</p>
              <p className="text-xl font-bold text-primary">
                R$ {(parseFloat(price) * item.quantity).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={!price}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
