import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingList } from '@/types/shopping';
import { Check } from 'lucide-react';

interface ListSwitcherDialogProps {
  open: boolean;
  onClose: () => void;
  currentListId: string | null;
  lists: ShoppingList[];
  onSwitchList: (listId: string) => void;
  onCreateNew: () => void;
  onEditList: (list: ShoppingList) => void;
  loading?: boolean;
}

export const ListSwitcherDialog = ({
  open,
  onClose,
  currentListId,
  lists,
  onSwitchList,
  onCreateNew,
  onEditList,
  loading = false,
}: ListSwitcherDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Minhas Listas de Compras</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
          {lists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma lista encontrada
            </p>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  if (list.id !== currentListId) {
                    onSwitchList(list.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  list.id === currentListId
                    ? 'bg-primary/10 border-primary'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium text-foreground">{list.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Criada em {new Date(list.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {list.id === currentListId && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))
          )}
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClose();
              onCreateNew();
            }}
          >
            Nova Lista
          </Button>
          {currentListId && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const current = lists.find(l => l.id === currentListId);
                if (current) {
                  onClose();
                  onEditList(current);
                }
              }}
            >
              Editar Nome
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
