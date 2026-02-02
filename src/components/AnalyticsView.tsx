import { useMemo, useState } from 'react';
import { useReceipts } from '@/hooks/useReceipts';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Store, Calendar, DollarSign, Loader2, History } from 'lucide-react';
import { PriceHistoryDialog } from './PriceHistoryDialog';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--accent))',
];

export const AnalyticsView = () => {
  const { receipts, loading: receiptsLoading } = useReceipts();
  const { priceHistory } = usePriceHistory();
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);

  const monthlySpending = useMemo(() => {
    const monthMap = new Map<string, number>();
    
    receipts.forEach(receipt => {
      const date = new Date(receipt.purchase_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + receipt.total_amount);
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          total: value,
        };
      });
  }, [receipts]);

  const marketComparison = useMemo(() => {
    const marketMap = new Map<string, { total: number; count: number }>();
    
    receipts.forEach(receipt => {
      const market = receipt.market || 'Não especificado';
      const current = marketMap.get(market) || { total: 0, count: 0 };
      marketMap.set(market, {
        total: current.total + receipt.total_amount,
        count: current.count + 1,
      });
    });

    return Array.from(marketMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [receipts]);

  const priceByMarket = useMemo(() => {
    const marketMap = new Map<string, number>();
    
    priceHistory.forEach(price => {
      const market = price.market || 'Outros';
      const current = marketMap.get(market) || 0;
      marketMap.set(market, current + price.unit_price);
    });

    return Array.from(marketMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [priceHistory]);

  const totalSpent = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.total_amount, 0);
  }, [receipts]);

  const avgPerTrip = useMemo(() => {
    if (receipts.length === 0) return 0;
    return totalSpent / receipts.length;
  }, [receipts, totalSpent]);

  const mostUsedMarket = useMemo(() => {
    if (marketComparison.length === 0) return 'N/A';
    return marketComparison[0].name;
  }, [marketComparison]);

  if (receiptsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Sem dados suficientes</h3>
        <p className="text-sm text-muted-foreground">
          Finalize algumas compras para ver as estatísticas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price History Button */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setPriceHistoryOpen(true)}
      >
        <History className="w-4 h-4 mr-2" />
        Ver Histórico de Preços
      </Button>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Gasto</span>
            </div>
            <p className="text-xl font-bold text-primary">
              R$ {totalSpent.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/30 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-foreground" />
              <span className="text-xs text-muted-foreground">Média/Compra</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              R$ {avgPerTrip.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Mercado Favorito</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">
              {mostUsedMarket}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Compras</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {receipts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spending Chart */}
      {monthlySpending.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Gastos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Comparison */}
      {marketComparison.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="w-4 h-4" />
              Comparativo de Mercados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketComparison}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="total"
                    nameKey="name"
                    label={({ name, percent }) => 
                      `${name.slice(0, 10)}${name.length > 10 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {marketComparison.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `R$ ${value.toFixed(2)}`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Market details list */}
            <div className="space-y-2 mt-4">
              {marketComparison.map((market, index) => (
                <div key={market.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{market.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">R$ {market.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {market.count} compra{market.count > 1 ? 's' : ''} • Média R$ {market.average.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PriceHistoryDialog 
        open={priceHistoryOpen} 
        onClose={() => setPriceHistoryOpen(false)} 
      />
    </div>
  );
};
