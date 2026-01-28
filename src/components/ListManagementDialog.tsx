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
  onClose: (open: boolean) => void;
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
    if (list) setListName(list.name);
    else setListName('');
  }, [list, isCreating]);

  const handleSave = () => {
    if (!listName.trim()) return;
    onSave(listName.trim());
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Criar nova lista' : 'Editar lista'}
          </DialogTitle>
        </DialogHeader>

        <Input
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Nome da lista"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
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
