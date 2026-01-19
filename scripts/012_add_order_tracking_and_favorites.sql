-- Add order_status column to transactions table for detailed tracking
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'payment_made';

-- Enum values: payment_made, buyer_received_order, buyer_processing, buyer_sent_order, courier_received, out_for_delivery, delivered

-- Add shipping tracking information
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add views column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create favorites/wishlist table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON public.favorites(listing_id);

-- Create order_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_select_own" ON public.order_status_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t 
      WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE INDEX idx_order_status_history_transaction_id ON public.order_status_history(transaction_id);

-- Update RLS policy for listings to hide paid items
DROP POLICY IF EXISTS "listings_select_all" ON public.listings;

CREATE POLICY "listings_select_all" ON public.listings FOR SELECT 
  USING (
    (status = 'active' AND NOT EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE listing_id = listings.id AND status IN ('pending', 'completed')
    )) 
    OR auth.uid() = seller_id
    OR auth.uid() IN (
      SELECT buyer_id FROM public.transactions 
      WHERE listing_id = listings.id AND status IN ('pending', 'completed')
    )
  );
