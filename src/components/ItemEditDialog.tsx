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
  onClose: () => void;
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
    if (item) {
      setItemName(item.name);
    }
  }, [item, open]);

  const handleSave = () => {
    if (item && itemName.trim()) {
      onSave(item.id, itemName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar nome do item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome do item
            </label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Digite o novo nome"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
