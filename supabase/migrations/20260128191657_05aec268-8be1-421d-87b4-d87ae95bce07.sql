-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create shopping lists table
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Lista de Compras',
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shopping lists
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Shopping lists policies
CREATE POLICY "Users can view their own lists" ON public.shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lists" ON public.shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lists" ON public.shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lists" ON public.shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies via shopping lists
CREATE POLICY "Users can view categories of their lists" ON public.categories FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can create categories in their lists" ON public.categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update categories in their lists" ON public.categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete categories in their lists" ON public.categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = list_id AND user_id = auth.uid()));

-- Create shopping items table
CREATE TABLE public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2),
  market TEXT,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shopping items
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Shopping items policies via categories and lists
CREATE POLICY "Users can view items in their categories" ON public.shopping_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.categories c 
    JOIN public.shopping_lists sl ON c.list_id = sl.id 
    WHERE c.id = category_id AND sl.user_id = auth.uid()
  ));
CREATE POLICY "Users can create items in their categories" ON public.shopping_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.categories c 
    JOIN public.shopping_lists sl ON c.list_id = sl.id 
    WHERE c.id = category_id AND sl.user_id = auth.uid()
  ));
CREATE POLICY "Users can update items in their categories" ON public.shopping_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.categories c 
    JOIN public.shopping_lists sl ON c.list_id = sl.id 
    WHERE c.id = category_id AND sl.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete items in their categories" ON public.shopping_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.categories c 
    JOIN public.shopping_lists sl ON c.list_id = sl.id 
    WHERE c.id = category_id AND sl.user_id = auth.uid()
  ));

-- Create price history table
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  market TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on price history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Price history policies
CREATE POLICY "Users can view their price history" ON public.price_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create price history" ON public.price_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create receipts table (NFs)
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES public.shopping_lists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  has_discount BOOLEAN NOT NULL DEFAULT false,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  market TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Receipts policies
CREATE POLICY "Users can view their receipts" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create receipts" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their receipts" ON public.receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their receipts" ON public.receipts FOR DELETE USING (auth.uid() = user_id);

-- Create receipt items table
CREATE TABLE public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- Enable RLS on receipt items
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- Receipt items policies via receipts
CREATE POLICY "Users can view items in their receipts" ON public.receipt_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE id = receipt_id AND user_id = auth.uid()));
CREATE POLICY "Users can create items in their receipts" ON public.receipt_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.receipts WHERE id = receipt_id AND user_id = auth.uid()));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON public.shopping_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();