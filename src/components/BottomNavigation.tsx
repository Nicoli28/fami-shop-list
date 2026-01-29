import { ShoppingCart, Receipt, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: 'list' | 'receipts' | 'analytics';
  onTabChange: (tab: 'list' | 'receipts' | 'analytics') => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 shadow-lg z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        <button
          onClick={() => onTabChange('list')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all",
            activeTab === 'list' 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Lista</span>
        </button>

        <button
          onClick={() => onTabChange('receipts')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all",
            activeTab === 'receipts' 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-xs font-medium">NF's</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all",
            activeTab === 'analytics' 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Análise</span>
        </button>

        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
};
