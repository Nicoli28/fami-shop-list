import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onSave: (categoryName: string) => void;
}

export const AddCategoryDialog = ({
  open,
  onClose,
  onSave,
}: AddCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSave = () => {
    if (!categoryName.trim()) return;
    onSave(categoryName.trim());
    setCategoryName('');
    onClose(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCategoryName('');
    }
    onClose(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Seção</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da seção</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Congelados, Pets, etc."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleClose(false);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!categoryName.trim()}>
            Criar Seção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
