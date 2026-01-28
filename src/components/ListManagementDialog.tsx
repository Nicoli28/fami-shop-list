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
import { ShoppingList } from '@/types/shopping';

interface ListManagementDialogProps {
  list: ShoppingList | null;
  open: boolean;
  onClose: () => void;
  onSave: (listName: string) => void;
  isCreating?: boolean;
}

export const ListManagementDialog = ({
  list,
  open,
  onClose,
  onSave,
  isCreating = false,
}: ListManagementDialogProps) => {
  const [listName, setListName] = useState('');

  useEffect(() => {
    if (list) {
      setListName(list.name);
    } else if (isCreating) {
      setListName('');
    }
  }, [list, open, isCreating]);

  const handleSave = () => {
    if (listName.trim()) {
      onSave(listName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Criar nova lista' : 'Editar nome da lista'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome da lista
            </label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder={isCreating ? "Digite o nome da nova lista" : "Digite o novo nome"}
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
            {isCreating ? 'Criar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
