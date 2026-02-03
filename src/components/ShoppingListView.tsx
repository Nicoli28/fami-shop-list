import { useState } from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useReceipts } from '@/hooks/useReceipts';
import { CategorySection } from '@/components/CategorySection';
import { PriceDialog } from '@/components/PriceDialog';
import { CheckoutDialog } from '@/components/CheckoutDialog';
import { ReceiptCard } from '@/components/ReceiptCard';
import { ReceiptDetailDialog } from '@/components/ReceiptDetailDialog';
import { ItemEditDialog } from '@/components/ItemEditDialog';
import { CategoryEditDialog } from '@/components/CategoryEditDialog';
import { ListManagementDialog } from '@/components/ListManagementDialog';
import { ListSwitcherDialog } from '@/components/ListSwitcherDialog';
import { AddCategoryDialog } from '@/components/AddCategoryDialog';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ReceiptScannerView } from '@/components/ReceiptScannerView';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ShoppingItem, CategoryWithItems } from '@/types/shopping';
import { ReceiptWithItems } from '@/hooks/useReceipts';
import { ShoppingCart, Receipt as ReceiptIcon, Loader2, List, Plus, BarChart3, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ShoppingListView = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'receipts' | 'scanner' | 'analytics'>('list');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithItems | null>(null);
  const [receiptDetailOpen, setReceiptDetailOpen] = useState(false);
  const [itemEditOpen, setItemEditOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithItems | null>(null);
  const [listManagementOpen, setListManagementOpen] = useState(false);
  const [listSwitcherOpen, setListSwitcherOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [allLists, setAllLists] = useState<any[]>([]);
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [editingList, setEditingList] = useState<any | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
  const [dragOverCategoryIndex, setDragOverCategoryIndex] = useState<number | null>(null);

  const {
    currentList,
    categories,
    loading: listLoading,
    updateItemQuantity,
    updateItemPrice,
    toggleItemChecked,
    addItem,
    deleteItem,
    updateItemName,
    updateCategoryName,
    updateListName,
    createCustomList,
    switchList,
    deleteCategory,
    deleteList,
    reorderCategories,
    reorderItems,
    getAllLists,
    calculateSubtotal,
    getItemsWithPrice,
    addCategory,
    resetItemsAfterCheckout
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

  const handleItemEditClick = (item: ShoppingItem) => {
    setItemToEdit(item);
    setItemEditOpen(true);
  };

  const handleCategoryEditClick = (category: CategoryWithItems) => {
    setCategoryToEdit(category);
    setCategoryEditOpen(true);
  };

  const handleItemNameSave = (itemId: string, newName: string) => {
    updateItemName(itemId, newName);
  };

  const handleCategoryNameSave = (categoryId: string, newName: string) => {
    updateCategoryName(categoryId, newName);
  };

  const handleOpenListSwitcher = async () => {
    const lists = await getAllLists();
    setAllLists(lists);
    setListSwitcherOpen(true);
  };

  const handleCreateNewList = (listName: string) => {
    createCustomList(listName);
  };

  const handleEditListName = (listName: string) => {
    if (currentList) {
      updateListName(currentList.id, listName);
    }
  };

  const handleAddCategory = (categoryName: string) => {
    addCategory(categoryName);
  };

  const handleDeleteCategoryClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCategoryIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
    setDragOverCategoryIndex(index);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedCategoryIndex === null || draggedCategoryIndex === targetIndex) {
      setDraggedCategoryIndex(null);
      setDragOverCategoryIndex(null);
      return;
    }

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedCategoryIndex, 1);
    newCategories.splice(targetIndex, 0, removed);
    reorderCategories(newCategories.map(c => c.id));
    
    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);
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

    // Reset items (uncheck and clear prices) for next shopping trip
    await resetItemsAfterCheckout();

    setActiveTab('receipts');
  };

  const handleReceiptClick = (receipt: ReceiptWithItems) => {
    setSelectedReceipt(receipt);
    setReceiptDetailOpen(true);
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'list':
        return currentList?.name || 'Lista de Compras';
      case 'receipts':
        return 'Notas Fiscais';
      case 'scanner':
        return 'Escanear NF';
      case 'analytics':
        return 'Análise de Gastos';
    }
  };

  const getHeaderIcon = () => {
    switch (activeTab) {
      case 'list':
        return <ShoppingCart className="w-5 h-5 text-primary-foreground" />;
      case 'receipts':
        return <ReceiptIcon className="w-5 h-5 text-primary-foreground" />;
      case 'scanner':
        return <ScanLine className="w-5 h-5 text-primary-foreground" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5 text-primary-foreground" />;
    }
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                {getHeaderIcon()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {getHeaderTitle()}
                </h1>
                {activeTab === 'list' && (
                  <p className="text-xs text-muted-foreground">
                    {categories.reduce((acc, c) => acc + c.items.length, 0)} itens
                  </p>
                )}
              </div>
            </div>
            {activeTab === 'list' && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddCategoryOpen(true)}
                  title="Nova seção"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenListSwitcher}
                  title="Trocar lista"
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-52">
        {activeTab === 'list' && (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleCategoryDragStart(e, index)}
                onDragOver={(e) => handleCategoryDragOver(e, index)}
                onDrop={(e) => handleCategoryDrop(e, index)}
                onDragEnd={handleCategoryDragEnd}
                className={cn(
                  "transition-all",
                  draggedCategoryIndex === index && "opacity-50 scale-[0.98]",
                  dragOverCategoryIndex === index && "ring-2 ring-primary rounded-2xl"
                )}
              >
                <CategorySection
                  category={category}
                  onQuantityChange={updateItemQuantity}
                  onToggleChecked={toggleItemChecked}
                  onPriceClick={handlePriceClick}
                  onDeleteItem={deleteItem}
                  onAddItem={addItem}
                  onEditCategoryName={handleCategoryEditClick}
                  onEditItemName={handleItemEditClick}
                  onDeleteCategory={handleDeleteCategoryClick}
                  onReorderItems={reorderItems}
                  isReorderMode={draggedCategoryIndex === index}
                />
              </div>
            ))}
            
            {/* Add category button at the bottom */}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setAddCategoryOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar nova seção
            </Button>
          </div>
        )}

        {activeTab === 'receipts' && (
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

        {activeTab === 'scanner' && (
          <ReceiptScannerView onReceiptSaved={() => setActiveTab('receipts')} />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
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

      <ItemEditDialog
        item={itemToEdit}
        open={itemEditOpen}
        onClose={() => setItemEditOpen(false)}
        onSave={handleItemNameSave}
      />

      <CategoryEditDialog
        category={categoryToEdit}
        open={categoryEditOpen}
        onClose={() => setCategoryEditOpen(false)}
        onSave={handleCategoryNameSave}
      />

      <AddCategoryDialog
        open={addCategoryOpen}
        onClose={setAddCategoryOpen}
        onSave={handleAddCategory}
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

      <ListManagementDialog
        list={editingList}
        open={listManagementOpen}
        onClose={() => {
          setListManagementOpen(false);
          setEditingList(null);
          setIsCreatingNewList(false);
        }}
        onSave={isCreatingNewList ? handleCreateNewList : handleEditListName}
        isCreating={isCreatingNewList}
      />

      <ListSwitcherDialog
        open={listSwitcherOpen}
        onClose={() => setListSwitcherOpen(false)}
        currentListId={currentList?.id || null}
        lists={allLists}
        onSwitchList={switchList}
        onDeleteList={deleteList}
        onCreateNew={() => {
          setIsCreatingNewList(true);
          setEditingList(null);
          setListManagementOpen(true);
        }}
        onEditList={(list) => {
          setEditingList(list);
          setIsCreatingNewList(false);
          setListManagementOpen(true);
        }}
      />

      <ConfirmDeleteDialog
        open={deleteCategoryDialogOpen}
        onClose={() => setDeleteCategoryDialogOpen(false)}
        onConfirm={handleConfirmDeleteCategory}
        title="Excluir seção?"
        description="Tem certeza que deseja excluir esta seção? Todos os itens dentro dela serão removidos permanentemente."
      />
    </div>
  );
};
