import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingList } from '@/types/shopping';
import { Check, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface ListSwitcherDialogProps {
  open: boolean;
  onClose: () => void;
  currentListId: string | null;
  lists: ShoppingList[];
  onSwitchList: (listId: string) => void;
  onCreateNew: () => void;
  onEditList: (list: ShoppingList) => void;
  onDeleteList?: (listId: string) => void;
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
  onDeleteList,
  loading = false,
}: ListSwitcherDialogProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, list: ShoppingList) => {
    e.stopPropagation();
    setListToDelete(list);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (listToDelete && onDeleteList) {
      onDeleteList(listToDelete.id);
      setListToDelete(null);
    }
  };

  return (
    <>
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
                <div
                  key={list.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    list.id === currentListId
                      ? 'bg-primary/10 border-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <button
                    onClick={() => {
                      if (list.id !== currentListId) {
                        onSwitchList(list.id);
                      }
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium text-foreground">{list.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Criada em {new Date(list.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </button>
                  {list.id === currentListId && (
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  )}
                  {onDeleteList && lists.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteClick(e, list)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir lista?"
        description={`Tem certeza que deseja excluir a lista "${listToDelete?.name}"? Todos os itens e categorias serão removidos permanentemente.`}
      />
    </>
  );
};
