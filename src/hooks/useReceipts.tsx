import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Receipt, ReceiptItem } from '@/types/shopping';
import { toast } from 'sonner';

export interface ReceiptWithItems extends Receipt {
  items: ReceiptItem[];
}

export const useReceipts = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    if (!user) return;

    setLoading(true);
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false });

    if (receiptsError) {
      console.error('Error fetching receipts:', receiptsError);
      setLoading(false);
      return;
    }

    if (!receiptsData || receiptsData.length === 0) {
      setReceipts([]);
      setLoading(false);
      return;
    }

    const receiptIds = receiptsData.map(r => r.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('receipt_items')
      .select('*')
      .in('receipt_id', receiptIds);

    if (itemsError) {
      console.error('Error fetching receipt items:', itemsError);
    }

    const receiptsWithItems: ReceiptWithItems[] = receiptsData.map(receipt => ({
      ...receipt,
      items: (itemsData || []).filter(item => item.receipt_id === receipt.id) as ReceiptItem[]
    }));

    setReceipts(receiptsWithItems);
    setLoading(false);
  };

  const createReceipt = async (
    title: string,
    totalAmount: number,
    paymentMethod: string,
    hasDiscount: boolean,
    discountAmount: number,
    market: string,
    items: { name: string; quantity: number; unit_price: number; total_price: number }[],
    listId?: string
  ) => {
    if (!user) return null;

    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: user.id,
        list_id: listId || null,
        title,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        has_discount: hasDiscount,
        discount_amount: discountAmount,
        market: market || null,
        purchase_date: new Date().toISOString()
      })
      .select()
      .single();

    if (receiptError || !receipt) {
      toast.error('Erro ao criar nota fiscal');
      return null;
    }

    // Insert receipt items
    if (items.length > 0) {
      const itemInserts = items.map(item => ({
        receipt_id: receipt.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(itemInserts);

      if (itemsError) {
        console.error('Error inserting receipt items:', itemsError);
      }
    }

    await fetchReceipts();
    toast.success('Nota fiscal criada com sucesso!');
    return receipt;
  };

  const deleteReceipt = async (receiptId: string) => {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId);

    if (error) {
      toast.error('Erro ao excluir nota fiscal');
      return;
    }

    setReceipts(prev => prev.filter(r => r.id !== receiptId));
    toast.success('Nota fiscal excluída');
  };

  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  return {
    receipts,
    loading,
    createReceipt,
    deleteReceipt,
    refreshReceipts: fetchReceipts
  };
};
