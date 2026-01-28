import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  ShoppingList, 
  Category, 
  ShoppingItem, 
  CategoryWithItems,
  DEFAULT_CATEGORIES,
  INITIAL_ITEMS 
} from '@/types/shopping';
import { toast } from 'sonner';

export const useShoppingList = () => {
  const { user } = useAuth();
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateList = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Try to fetch existing active list
    const { data: existingList, error: fetchError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching list:', fetchError);
      setLoading(false);
      return;
    }

    if (existingList) {
      setCurrentList(existingList as ShoppingList);
      await fetchCategoriesAndItems(existingList.id);
    } else {
      // Create new list with initial items
      await createNewList(currentMonth, currentYear);
    }
    setLoading(false);
  }, [user]);

  const createNewList = async (month: number, year: number) => {
    if (!user) return;

    const { data: newList, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        name: `Lista de ${getMonthName(month)} ${year}`,
        month,
        year,
        is_active: true
      })
      .select()
      .single();

    if (listError || !newList) {
      console.error('Error creating list:', listError);
      toast.error('Erro ao criar lista');
      return;
    }

    setCurrentList(newList as ShoppingList);

    // Create default categories
    const categoryInserts = DEFAULT_CATEGORIES.map((name, index) => ({
      list_id: newList.id,
      name,
      is_custom: name === 'Extra',
      sort_order: index
    }));

    const { data: createdCategories, error: catError } = await supabase
      .from('categories')
      .insert(categoryInserts)
      .select();

    if (catError || !createdCategories) {
      console.error('Error creating categories:', catError);
      return;
    }

    // Create initial items
    const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));
    const itemInserts: { category_id: string; name: string; quantity: number; sort_order: number }[] = [];

    INITIAL_ITEMS.forEach(({ category, items }) => {
      const categoryId = categoryMap.get(category);
      if (categoryId) {
        items.forEach((item, index) => {
          itemInserts.push({
            category_id: categoryId,
            name: item.name,
            quantity: item.quantity,
            sort_order: index
          });
        });
      }
    });

    if (itemInserts.length > 0) {
      await supabase.from('shopping_items').insert(itemInserts);
    }

    await fetchCategoriesAndItems(newList.id);
  };

  const fetchCategoriesAndItems = async (listId: string) => {
    const { data: cats, error: catsError } = await supabase
      .from('categories')
      .select('*')
      .eq('list_id', listId)
      .order('sort_order');

    if (catsError || !cats) {
      console.error('Error fetching categories:', catsError);
      return;
    }

    const categoryIds = cats.map(c => c.id);
    const { data: items, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .in('category_id', categoryIds)
      .order('sort_order');

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
    }

    const categoriesWithItems: CategoryWithItems[] = cats.map(cat => ({
      ...cat,
      items: (items || []).filter(item => item.category_id === cat.id) as ShoppingItem[]
    }));

    setCategories(categoriesWithItems);
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const { error } = await supabase
      .from('shopping_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      toast.error('Erro ao atualizar quantidade');
      return;
    }

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    })));
  };

  const updateItemPrice = async (itemId: string, unitPrice: number, market?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('shopping_items')
      .update({ unit_price: unitPrice, market: market || null })
      .eq('id', itemId);

    if (error) {
      toast.error('Erro ao atualizar preço');
      return;
    }

    // Find the item name for price history
    let itemName = '';
    categories.forEach(cat => {
      const item = cat.items.find(i => i.id === itemId);
      if (item) itemName = item.name;
    });

    // Save to price history
    if (itemName) {
      await supabase.from('price_history').insert({
        item_name: itemName,
        user_id: user.id,
        unit_price: unitPrice,
        market: market || null
      });
    }

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId ? { ...item, unit_price: unitPrice, market: market || null } : item
      )
    })));

    toast.success('Preço atualizado!');
  };

  const toggleItemChecked = async (itemId: string) => {
    const item = categories.flatMap(c => c.items).find(i => i.id === itemId);
    if (!item) return;

    const { error } = await supabase
      .from('shopping_items')
      .update({ is_checked: !item.is_checked })
      .eq('id', itemId);

    if (error) {
      toast.error('Erro ao marcar item');
      return;
    }

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(i => 
        i.id === itemId ? { ...i, is_checked: !i.is_checked } : i
      )
    })));
  };

  const addItem = async (categoryId: string, name: string, quantity: number = 1) => {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        category_id: categoryId,
        name,
        quantity,
        sort_order: 999
      })
      .select()
      .single();

    if (error || !data) {
      toast.error('Erro ao adicionar item');
      return;
    }

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: [...cat.items, data as ShoppingItem] }
        : cat
    ));

    toast.success('Item adicionado!');
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Erro ao remover item');
      return;
    }

    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.id !== itemId)
    })));

    toast.success('Item removido');
  };

  const calculateSubtotal = useCallback(() => {
    return categories.reduce((total, cat) => {
      return total + cat.items.reduce((catTotal, item) => {
        if (item.unit_price) {
          return catTotal + (item.quantity * item.unit_price);
        }
        return catTotal;
      }, 0);
    }, 0);
  }, [categories]);

  const getItemsWithPrice = useCallback(() => {
    return categories.flatMap(cat => 
      cat.items.filter(item => item.unit_price !== null && item.unit_price > 0)
    );
  }, [categories]);

  useEffect(() => {
    if (user) {
      fetchOrCreateList();
    }
  }, [user, fetchOrCreateList]);

  return {
    currentList,
    categories,
    loading,
    updateItemQuantity,
    updateItemPrice,
    toggleItemChecked,
    addItem,
    deleteItem,
    calculateSubtotal,
    getItemsWithPrice,
    refreshList: fetchOrCreateList
  };
};

const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || '';
};
