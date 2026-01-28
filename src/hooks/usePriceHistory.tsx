import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { PriceHistory } from '@/types/shopping';

export const usePriceHistory = () => {
  const { user } = useAuth();
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  const fetchPriceHistory = async (itemName?: string) => {
    if (!user) return [];

    let query = supabase
      .from('price_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false });

    if (itemName) {
      query = query.eq('item_name', itemName);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching price history:', error);
      return [];
    }

    setPriceHistory(data as PriceHistory[]);
    return data as PriceHistory[];
  };

  const getItemPriceHistory = async (itemName: string): Promise<PriceHistory[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_name', itemName)
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching item price history:', error);
      return [];
    }

    return data as PriceHistory[];
  };

  useEffect(() => {
    if (user) {
      fetchPriceHistory();
    }
  }, [user]);

  return {
    priceHistory,
    fetchPriceHistory,
    getItemPriceHistory
  };
};
