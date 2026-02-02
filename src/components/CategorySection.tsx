import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingItemCard } from './ShoppingItemCard';
import { CategoryWithItems, ShoppingItem } from '@/types/shopping';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  category: CategoryWithItems;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onToggleChecked: (itemId: string) => void;
  onPriceClick: (item: ShoppingItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (categoryId: string, name: string) => void;
  onEditCategoryName: (category: CategoryWithItems) => void;
  onEditItemName: (item: ShoppingItem) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onReorderItems?: (categoryId: string, itemIds: string[]) => void;
  isReorderMode?: boolean;
  onDragHandlePress?: () => void;
}

const getCategoryIcon = (name: string): string => {
  const icons: Record<string, string> = {
    'Mercearia': '🛒',
    'Bebidas': '🥤',
    'Laticínios': '🥛',
    'Açougue': '🥩',
    'Padaria': '🍞',
    'Hortifruti': '🥬',
    'Descartáveis e Papelaria': '📦',
    'Higiene e Limpeza': '🧼',
    'Extra': '✨'
  };
  return icons[name] || '📋';
};

export const CategorySection = ({
  category,
  onQuantityChange,
  onToggleChecked,
  onPriceClick,
  onDeleteItem,
  onAddItem,
  onEditCategoryName,
  onEditItemName,
  onDeleteCategory,
  onReorderItems,
  isReorderMode,
  onDragHandlePress
}: CategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(category.id, newItemName.trim());
      setNewItemName('');
      setShowAddInput(false);
    }
  };

  const categoryTotal = category.items.reduce((total, item) => {
    if (item.unit_price) {
      return total + (item.quantity * item.unit_price);
    }
    return total;
  }, 0);

  const itemCount = category.items.length;
  const checkedCount = category.items.filter(i => i.is_checked).length;

  // Item drag handlers
  const handleItemDragStart = (e: React.DragEvent, itemId: string) => {
    e.stopPropagation();
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleItemDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItemId || draggedItemId === itemId) return;
    setDragOverItemId(itemId);
  };

  const handleItemDragLeave = () => {
    setDragOverItemId(null);
  };

  const handleItemDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItemId || draggedItemId === targetItemId || !onReorderItems) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const currentIndex = category.items.findIndex(i => i.id === draggedItemId);
    const targetIndex = category.items.findIndex(i => i.id === targetItemId);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const newItems = [...category.items];
      const [removed] = newItems.splice(currentIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      onReorderItems(category.id, newItems.map(i => i.id));
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragHandleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Auto-collapse the section when user starts to drag
    if (isExpanded) {
      setIsExpanded(false);
    }
    onDragHandlePress?.();
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm transition-all",
      isReorderMode && "ring-2 ring-primary/50"
    )}>
      {/* Header */}
      <div className="flex items-center">
        <div
          className="p-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none select-none"
          onMouseDown={handleDragHandleMouseDown}
          onTouchStart={handleDragHandleMouseDown}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between p-4 pl-0 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{getCategoryIcon(category.name)}</span>
            <div className="text-left">
              <h3 className="font-semibold text-foreground">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {checkedCount}/{itemCount} itens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {categoryTotal > 0 && (
              <span className="text-sm font-semibold text-primary">
                R$ {categoryTotal.toFixed(2)}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>
        <div className="flex items-center pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEditCategoryName(category);
            }}
            title="Editar categoria"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          {onDeleteCategory && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(category.id);
              }}
              title="Excluir categoria"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-3 pt-0 space-y-2">
          {category.items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleItemDragStart(e, item.id)}
              onDragOver={(e) => handleItemDragOver(e, item.id)}
              onDragLeave={handleItemDragLeave}
              onDrop={(e) => handleItemDrop(e, item.id)}
              onDragEnd={handleItemDragEnd}
              className={cn(
                "transition-all",
                draggedItemId === item.id && "opacity-50 scale-95",
                dragOverItemId === item.id && "ring-2 ring-primary/50 rounded-xl"
              )}
            >
              <ShoppingItemCard
                item={item}
                onQuantityChange={onQuantityChange}
                onToggleChecked={onToggleChecked}
                onPriceClick={onPriceClick}
                onDelete={onDeleteItem}
                onEditName={onEditItemName}
                showDragHandle
              />
            </div>
          ))}

          {/* Add item */}
          {showAddInput ? (
            <div className="flex gap-2 pt-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Nome do item..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') setShowAddInput(false);
                }}
              />
              <Button size="sm" onClick={handleAddItem}>
                Adicionar
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setShowAddInput(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar item
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
