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
  onEditName
}: ShoppingItemCardProps) => {
  const totalPrice = item.unit_price ? item.quantity * item.unit_price : null;

  return (
    <div 
      className={cn(
        "flex flex-col gap-3 p-3 rounded-xl bg-card border border-border/50 transition-all duration-200",
        item.is_checked && "opacity-60 bg-muted/50"
      )}
    >
      {/* First row: Checkbox, Item name, Delete button */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleChecked(item.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5",
            item.is_checked 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
        >
          {item.is_checked && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>

        {/* Item name */}
        <div 
          className={cn(
            "flex-1 min-w-0 cursor-pointer",
            item.is_checked && "line-through"
          )}
          onClick={() => onPriceClick(item)}
        >
          <p className="text-sm font-medium text-foreground break-words">{item.name}</p>
          {item.unit_price && (
            <p className="text-xs text-muted-foreground">
              R$ {item.unit_price.toFixed(2)} cada
              {item.market && ` • ${item.market}`}
            </p>
          )}
        </div>

        {/* Edit button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full shrink-0 text-muted-foreground hover:text-primary mt-0.5"
          onClick={() => onEditName(item)}
          title="Editar nome"
        >
          <Edit2 className="w-3 h-3" />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Second row: Quantity controls and Price */}
      <div className="flex items-center gap-3 justify-between px-9">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-8 text-center font-semibold text-foreground">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Price */}
        <div className="text-right">
          {totalPrice !== null ? (
            <p className="text-sm font-semibold text-primary">
              R$ {totalPrice.toFixed(2)}
            </p>
          ) : (
            <button
              onClick={() => onPriceClick(item)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              + preço
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
