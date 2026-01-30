import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShoppingItem } from '@/types/shopping';
import { Receipt, CreditCard, Banknote, QrCode } from 'lucide-react';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  items: ShoppingItem[];
  onConfirm: (data: {
    title: string;
    paymentMethod: string;
    totalAmount: number;
    hasDiscount: boolean;
    discountAmount: number;
    market: string;
  }) => void;
}

export const CheckoutDialog = ({
  open,
  onClose,
  subtotal,
  items,
  onConfirm
}: CheckoutDialogProps) => {
  const [title, setTitle] = useState(`Compra ${new Date().toLocaleDateString('pt-BR')}`);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [totalAmount, setTotalAmount] = useState(subtotal.toString());
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [market, setMarket] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  const handleConfirm = () => {
    let finalPaymentMethod = paymentMethod;
    if ((paymentMethod === 'vr' || paymentMethod === 'va') && cardBrand) {
      finalPaymentMethod = `${paymentMethod.toUpperCase()} - ${cardBrand}`;
    }
    onConfirm({
      title,
      paymentMethod: finalPaymentMethod,
      totalAmount: parseFloat(totalAmount) || subtotal,
      hasDiscount,
      discountAmount: parseFloat(discountAmount) || 0,
      market
    });
    onClose();
  };

  const paymentMethods = [
    { value: 'pix', label: 'PIX', icon: QrCode },
    { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'vr', label: 'VR', icon: CreditCard },
    { value: 'va', label: 'VA', icon: CreditCard }
  ];

  const cardBrands = [
    { value: 'pluxee', label: 'Pluxee' },
    { value: 'alelo', label: 'Alelo' },
    { value: 'flash', label: 'Flash' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'vr', label: 'VR' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Finalizar Compra
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="bg-primary/10 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Itens com preço</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal calculado</span>
              <span className="font-bold text-lg text-primary">R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da compra</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Compra mensal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market">Mercado</Label>
            <Input
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="Ex: Supermercado X"
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => {
                    setPaymentMethod(method.value);
                    if (method.value !== 'vr' && method.value !== 'va') {
                      setCardBrand('');
                    }
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === method.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <method.icon className="w-4 h-4" />
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {(paymentMethod === 'vr' || paymentMethod === 'va') && (
            <div className="space-y-2 animate-fade-in">
              <Label>Bandeira do cartão</Label>
              <div className="grid grid-cols-3 gap-2">
                {cardBrands.map((brand) => (
                  <button
                    key={brand.value}
                    onClick={() => setCardBrand(brand.label)}
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      cardBrand === brand.label
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {brand.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="total">Valor total da compra (R$)</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="h-12 text-lg font-semibold"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="discount-switch" className="cursor-pointer">
              Houve desconto?
            </Label>
            <Switch
              id="discount-switch"
              checked={hasDiscount}
              onCheckedChange={setHasDiscount}
            />
          </div>

          {hasDiscount && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="discount-amount">Valor do desconto (R$)</Label>
              <Input
                id="discount-amount"
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            Gerar Nota Fiscal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
