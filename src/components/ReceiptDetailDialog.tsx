import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReceiptWithItems } from '@/hooks/useReceipts';
import { Calendar, CreditCard, MapPin, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptDetailDialogProps {
  receipt: ReceiptWithItems | null;
  open: boolean;
  onClose: () => void;
}

const getPaymentMethodLabel = (method: string | null): string => {
  const methods: Record<string, string> = {
    pix: 'PIX',
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    cash: 'Dinheiro'
  };
  return methods[method || ''] || method || 'Não informado';
};

export const ReceiptDetailDialog = ({ receipt, open, onClose }: ReceiptDetailDialogProps) => {
  if (!receipt) return null;

  const purchaseDate = new Date(receipt.purchase_date);

  const exportToCSV = () => {
    const headers = ['Item', 'Quantidade', 'Preço Unitário', 'Total'];
    const rows = receipt.items.map(item => [
      item.name,
      item.quantity.toString(),
      `R$ ${item.unit_price.toFixed(2)}`,
      `R$ ${item.total_price.toFixed(2)}`
    ]);
    
    const csvContent = [
      `Nota Fiscal: ${receipt.title}`,
      `Data: ${format(purchaseDate, "dd/MM/yyyy", { locale: ptBR })}`,
      `Mercado: ${receipt.market || 'Não informado'}`,
      `Pagamento: ${getPaymentMethodLabel(receipt.payment_method)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `Subtotal,,,R$ ${receipt.items.reduce((acc, i) => acc + i.total_price, 0).toFixed(2)}`,
      receipt.has_discount ? `Desconto,,,R$ ${receipt.discount_amount.toFixed(2)}` : '',
      `TOTAL,,,R$ ${receipt.total_amount.toFixed(2)}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${receipt.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Nota fiscal exportada!');
  };

  const itemsTotal = receipt.items.reduce((acc, item) => acc + item.total_price, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{receipt.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium">
                  {format(purchaseDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Pagamento</p>
                <p className="text-sm font-medium">
                  {getPaymentMethodLabel(receipt.payment_method)}
                </p>
              </div>
            </div>
            {receipt.market && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mercado</p>
                  <p className="text-sm font-medium">{receipt.market}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Itens</h4>
            <div className="bg-muted/30 rounded-lg divide-y divide-border/50">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between p-3">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x R$ {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    R$ {item.total_price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 p-4 rounded-xl bg-primary/10">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {itemsTotal.toFixed(2)}</span>
            </div>
            {receipt.has_discount && receipt.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>- R$ {receipt.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border/50">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                R$ {receipt.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Export */}
          <Button className="w-full" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar para Excel/CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
