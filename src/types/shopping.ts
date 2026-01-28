export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  month: number;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  list_id: string;
  name: string;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  category_id: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  market: string | null;
  is_checked: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  item_name: string;
  user_id: string;
  unit_price: number;
  market: string | null;
  recorded_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  list_id: string | null;
  title: string;
  total_amount: number;
  payment_method: string | null;
  has_discount: boolean;
  discount_amount: number;
  market: string | null;
  purchase_date: string;
  created_at: string;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CategoryWithItems extends Category {
  items: ShoppingItem[];
}

export const DEFAULT_CATEGORIES = [
  'Mercearia',
  'Bebidas',
  'Laticínios',
  'Açougue',
  'Padaria',
  'Hortifruti',
  'Descartáveis e Papelaria',
  'Higiene e Limpeza',
  'Extra'
];

export const INITIAL_ITEMS: { category: string; items: { name: string; quantity: number }[] }[] = [
  {
    category: 'Mercearia',
    items: [
      { name: 'Ovos (cartela com 20 unidades)', quantity: 7 },
      { name: 'Arroz 5kg', quantity: 1 },
      { name: 'Feijão 1kg', quantity: 2 },
      { name: 'Tapioca 1kg', quantity: 2 },
      { name: 'Óleo', quantity: 1 },
      { name: 'Sal', quantity: 1 },
      { name: 'Farinha de trigo', quantity: 1 },
      { name: 'Ketchup', quantity: 1 },
      { name: 'Fermento para bolos', quantity: 1 },
      { name: 'Cacau em pó 35%', quantity: 1 },
      { name: 'Açúcar', quantity: 1 },
      { name: 'Sacos de pipoca', quantity: 1 },
      { name: 'Pipoca', quantity: 1 },
      { name: 'Papel manteiga', quantity: 1 },
      { name: 'Margarina 1kg', quantity: 1 },
      { name: 'Chocolate meio amargo 1kg', quantity: 1 },
      { name: 'Nutella (tamanho médio)', quantity: 1 },
    ]
  },
  {
    category: 'Descartáveis e Papelaria',
    items: [
      { name: 'Pratos descartáveis', quantity: 2 },
      { name: 'Copos descartáveis', quantity: 1 },
      { name: 'Papel toalha', quantity: 1 },
      { name: 'Guardanapo', quantity: 1 },
    ]
  },
  {
    category: 'Laticínios',
    items: [
      { name: 'Leite semidesnatado', quantity: 3 },
      { name: 'Requeijão light', quantity: 2 },
      { name: 'Ricota light', quantity: 2 },
    ]
  },
  {
    category: 'Hortifruti',
    items: [
      { name: 'Uva', quantity: 1 },
    ]
  },
  {
    category: 'Higiene e Limpeza',
    items: [
      { name: 'Cândida 2L', quantity: 1 },
      { name: 'Pato para privada', quantity: 1 },
      { name: 'Pedras para caixa acoplada', quantity: 1 },
      { name: 'Lysoform suave', quantity: 1 },
      { name: 'Detergente', quantity: 2 },
      { name: 'Shampoo e condicionador', quantity: 1 },
      { name: 'Refil de sabonete corporal', quantity: 1 },
      { name: 'Refil de sabonete íntimo', quantity: 1 },
      { name: 'Pasta de dente para sensibilidade', quantity: 1 },
      { name: 'Sabão líquido 1L', quantity: 1 },
      { name: 'Amaciante 500ml', quantity: 1 },
      { name: 'Álcool', quantity: 1 },
      { name: 'Listerine', quantity: 1 },
    ]
  }
];
