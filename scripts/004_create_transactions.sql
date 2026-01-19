-- Create transactions table for sales
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS policies
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "transactions_insert_buyer" ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "transactions_update_parties" ON public.transactions FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);
CREATE INDEX idx_transactions_listing_id ON public.transactions(listing_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
