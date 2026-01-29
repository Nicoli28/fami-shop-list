import { Minus, Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShoppingItem } from '@/types/shopping';
import { cn } from '@/lib/utils';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onToggleChecked: (itemId: string) => void;
  onPriceClick: (item: ShoppingItem) => void;
  onDelete: (itemId: string) => void;
  onEditName: (item: ShoppingItem) => void;
}

export const ShoppingItemCard = ({
  item,
  onQuantityChange,
  onToggleChecked,
  onPriceClick,
  onDelete,
  onEditName,
}: ShoppingItemCardProps) => {
  const totalPrice =
    item.unit_price && item.quantity > 0
      ? item.quantity * item.unit_price
      : null;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-xl bg-card border border-border/50 transition-all',
        item.is_checked && 'opacity-60 bg-muted/50'
      )}
    >
      {/* Row 1: Checkbox + Name + Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleChecked(item.id)}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
            item.is_checked
              ? 'bg-primary border-primary'
              : 'border-muted-foreground/30'
          )}
        >
          {item.is_checked && (
            <Check className="w-3 h-3 text-primary-foreground" />
          )}
        </button>

        <div
          className={cn(
            'flex-1 min-w-0 cursor-pointer',
            item.is_checked && 'line-through'
          )}
          onClick={() => onPriceClick(item)}
        >
          <p className="text-sm font-medium truncate">{item.name}</p>
          {item.unit_price && (
            <p className="text-xs text-muted-foreground truncate">
              R$ {item.unit_price.toFixed(2)}
              {item.market && ` • ${item.market}`}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onEditName(item)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Row 2: Quantity controls + Total price */}
      <div className="flex justify-between items-center pl-8">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={item.quantity === 0}
            onClick={() =>
              onQuantityChange(item.id, Math.max(0, item.quantity - 1))
            }
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center font-semibold text-sm">
            {item.quantity}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() =>
              onQuantityChange(item.id, item.quantity + 1)
            }
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {totalPrice !== null ? (
          <p className="font-semibold text-primary text-sm">
            R$ {totalPrice.toFixed(2)}
          </p>
        ) : (
          <button
            onClick={() => onPriceClick(item)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + adicionar preço
          </button>
        )}
      </div>
    </div>
  );
};
