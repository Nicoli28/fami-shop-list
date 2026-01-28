import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptWithItems } from '@/hooks/useReceipts';
import { ChevronRight, Calendar, CreditCard, Trash2, FileSpreadsheet } from 'lucide-react';

interface ReceiptCardProps {
  receipt: ReceiptWithItems;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const getPaymentMethodLabel = (method: string | null): string => {
  const methods: Record<string, string> = {
    pix: 'PIX',
    credit: 'Crédito',
    debit: 'Débito',
    cash: 'Dinheiro'
  };
  return methods[method || ''] || method || 'Não informado';
};

export const ReceiptCard = ({ receipt, onClick, onDelete }: ReceiptCardProps) => {
  const purchaseDate = new Date(receipt.purchase_date);
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="pb-2 relative">
        {/* Receipt effect - notched edges */}
        <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-background" />
          ))}
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{receipt.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              {format(purchaseDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {receipt.market && (
              <p className="text-sm text-muted-foreground">{receipt.market}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="w-3 h-3" />
              {getPaymentMethodLabel(receipt.payment_method)}
            </div>
            {receipt.has_discount && receipt.discount_amount > 0 && (
              <p className="text-xs text-green-600">
                Desconto: R$ {receipt.discount_amount.toFixed(2)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              R$ {receipt.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {receipt.items.length} itens
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(receipt.id);
            }}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
