import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { PriceHistory } from '@/types/shopping';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus, History, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PriceHistoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PriceHistoryDialog = ({ open, onClose }: PriceHistoryDialogProps) => {
  const { priceHistory, fetchPriceHistory } = usePriceHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedHistory, setGroupedHistory] = useState<Map<string, PriceHistory[]>>(new Map());

  useEffect(() => {
    if (open) {
      fetchPriceHistory();
    }
  }, [open]);

  useEffect(() => {
    // Group by item name
    const grouped = new Map<string, PriceHistory[]>();
    priceHistory.forEach(item => {
      const existing = grouped.get(item.item_name) || [];
      existing.push(item);
      grouped.set(item.item_name, existing);
    });
    setGroupedHistory(grouped);
  }, [priceHistory]);

  const filteredItems = Array.from(groupedHistory.entries()).filter(([itemName]) =>
    itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriceTrend = (prices: PriceHistory[]) => {
    if (prices.length < 2) return null;
    const latest = prices[0].unit_price;
    const previous = prices[1].unit_price;
    
    if (latest > previous) {
      return { icon: TrendingUp, color: 'text-destructive', label: 'Subiu' };
    } else if (latest < previous) {
      return { icon: TrendingDown, color: 'text-green-600', label: 'Baixou' };
    }
    return { icon: Minus, color: 'text-muted-foreground', label: 'Estável' };
  };

  const getAveragePrice = (prices: PriceHistory[]) => {
    const sum = prices.reduce((acc, p) => acc + p.unit_price, 0);
    return sum / prices.length;
  };

  const getMinMaxPrice = (prices: PriceHistory[]) => {
    const priceValues = prices.map(p => p.unit_price);
    return {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues)
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Preços
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[50vh]">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum histórico de preços ainda'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(([itemName, prices]) => {
                  const trend = getPriceTrend(prices);
                  const avg = getAveragePrice(prices);
                  const { min, max } = getMinMaxPrice(prices);

                  return (
                    <div key={itemName} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{itemName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prices.length} registro{prices.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        {trend && (
                          <div className={`flex items-center gap-1 ${trend.color}`}>
                            <trend.icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{trend.label}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Mínimo</p>
                          <p className="font-semibold text-green-600">R$ {min.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Média</p>
                          <p className="font-semibold text-foreground">R$ {avg.toFixed(2)}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Máximo</p>
                          <p className="font-semibold text-destructive">R$ {max.toFixed(2)}</p>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Data</TableHead>
                            <TableHead className="text-xs">Preço</TableHead>
                            <TableHead className="text-xs">Mercado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prices.slice(0, 5).map((price) => (
                            <TableRow key={price.id}>
                              <TableCell className="text-xs py-2">
                                {format(new Date(price.recorded_at), "dd/MM/yy", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="text-xs py-2 font-medium">
                                R$ {price.unit_price.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-xs py-2 text-muted-foreground">
                                {price.market || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
