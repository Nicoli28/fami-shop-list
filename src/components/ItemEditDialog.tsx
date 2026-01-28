import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingItem } from '@/types/shopping';

interface ItemEditDialogProps {
  item: ShoppingItem | null;
  open: boolean;
  onClose: (open: boolean) => void;
  onSave: (itemId: string, newName: string) => void;
}

export const ItemEditDialog = ({
  item,
  open,
  onClose,
  onSave,
}: ItemEditDialogProps) => {
  const [itemName, setItemName] = useState('');

  useEffect(() => {
    if (item) setItemName(item.name);
    else setItemName('');
  }, [item]);

  const handleSave = () => {
    if (!item || !itemName.trim()) return;
    onSave(item.id, itemName.trim());
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar nome do item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <label className="text-sm font-medium text-foreground">
            Nome do item
          </label>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Digite o novo nome"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!itemName.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
