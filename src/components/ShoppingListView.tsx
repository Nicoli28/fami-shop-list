import { useState } from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useReceipts } from '@/hooks/useReceipts';
import { CategorySection } from '@/components/CategorySection';
import { PriceDialog } from '@/components/PriceDialog';
import { CheckoutDialog } from '@/components/CheckoutDialog';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ReceiptDetailDialog } from '@/components/ReceiptDetailDialog';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ShoppingItem } from '@/types/shopping';
import { ReceiptWithItems } from '@/hooks/useReceipts';
import { ShoppingCart, Receipt as ReceiptIcon, Loader2 } from 'lucide-react';

export const ShoppingListView = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'receipts'>('list');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithItems | null>(null);
  const [receiptDetailOpen, setReceiptDetailOpen] = useState(false);

  const {
    currentList,
    categories,
    loading: listLoading,
    updateItemQuantity,
    updateItemPrice,
    toggleItemChecked,
    addItem,
    deleteItem,
    calculateSubtotal,
    getItemsWithPrice
  } = useShoppingList();

  const {
    receipts,
    loading: receiptsLoading,
    createReceipt,
    deleteReceipt
  } = useReceipts();

  const subtotal = calculateSubtotal();
  const itemsWithPrice = getItemsWithPrice();

  const handlePriceClick = (item: ShoppingItem) => {
    setSelectedItem(item);
    setPriceDialogOpen(true);
  };

  const handlePriceSave = (itemId: string, price: number, market?: string) => {
    updateItemPrice(itemId, price, market);
  };

  const handleCheckout = async (data: {
    title: string;
    paymentMethod: string;
    totalAmount: number;
    hasDiscount: boolean;
    discountAmount: number;
    market: string;
  }) => {
    const items = itemsWithPrice.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price!,
      total_price: item.quantity * item.unit_price!
    }));

    await createReceipt(
      data.title,
      data.totalAmount,
      data.paymentMethod,
      data.hasDiscount,
      data.discountAmount,
      data.market,
      items,
      currentList?.id
    );

    setActiveTab('receipts');
  };

  const handleReceiptClick = (receipt: ReceiptWithItems) => {
    setSelectedReceipt(receipt);
    setReceiptDetailOpen(true);
  };

  if (listLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 z-40 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {activeTab === 'list' ? currentList?.name || 'Lista de Compras' : 'Notas Fiscais'}
              </h1>
              {activeTab === 'list' && (
                <p className="text-xs text-muted-foreground">
                  {categories.reduce((acc, c) => acc + c.items.length, 0)} itens
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'list' ? (
          <div className="space-y-4">
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onQuantityChange={updateItemQuantity}
                onToggleChecked={toggleItemChecked}
                onPriceClick={handlePriceClick}
                onDeleteItem={deleteItem}
                onAddItem={addItem}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {receiptsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-12">
                <ReceiptIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Nenhuma nota fiscal</h3>
                <p className="text-sm text-muted-foreground">
                  Finalize uma compra para gerar sua primeira nota fiscal
                </p>
              </div>
            ) : (
              receipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  onClick={() => handleReceiptClick(receipt)}
                  onDelete={deleteReceipt}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Subtotal */}
      {activeTab === 'list' && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
          <div className="max-w-lg mx-auto">
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Subtotal</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {subtotal.toFixed(2)}
                </p>
              </div>
              <Button 
                size="lg"
                className="rounded-xl font-semibold"
                onClick={() => setCheckoutDialogOpen(true)}
                disabled={itemsWithPrice.length === 0}
              >
                Finalizar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dialogs */}
      <PriceDialog
        item={selectedItem}
        open={priceDialogOpen}
        onClose={() => setPriceDialogOpen(false)}
        onSave={handlePriceSave}
      />

      <CheckoutDialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        subtotal={subtotal}
        items={itemsWithPrice}
        onConfirm={handleCheckout}
      />

      <ReceiptDetailDialog
        receipt={selectedReceipt}
        open={receiptDetailOpen}
        onClose={() => setReceiptDetailOpen(false)}
      />
    </div>
  );
};
