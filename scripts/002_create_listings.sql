-- Create listings table for items for sale
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  condition TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'active',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Listings RLS policies
CREATE POLICY "listings_select_all" ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "listings_insert_own" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "listings_update_own" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "listings_delete_own" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Create index for faster queries
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
