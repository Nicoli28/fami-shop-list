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
        'flex flex-col gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all',
        item.is_checked && 'opacity-60 bg-muted/50'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleChecked(item.id)}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5',
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
            'flex-1 cursor-pointer',
            item.is_checked && 'line-through'
          )}
          onClick={() => onPriceClick(item)}
        >
          <p className="text-sm font-medium">{item.name}</p>
          {item.unit_price && (
            <p className="text-xs text-muted-foreground">
              R$ {item.unit_price.toFixed(2)}
              {item.market && ` • ${item.market}`}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditName(item)}
        >
          <Edit2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center px-9">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            disabled={item.quantity === 0}
            onClick={() =>
              onQuantityChange(item.id, Math.max(0, item.quantity - 1))
            }
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center font-semibold">
            {item.quantity}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              onQuantityChange(item.id, item.quantity + 1)
            }
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {totalPrice !== null ? (
          <p className="font-semibold text-primary">
            R$ {totalPrice.toFixed(2)}
          </p>
        ) : (
          <button
            onClick={() => onPriceClick(item)}
            className="text-xs text-muted-foreground"
          >
            + preço
          </button>
        )}
      </div>
    </div>
  );
};
