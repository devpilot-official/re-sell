-- Update listings table to support multiple categories and better structure
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS condition_id UUID;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS seller_notes TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT false;

-- Create listing images with order and verification
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listing_images_select_all" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "listing_images_insert_own_listing" ON public.listing_images 
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT seller_id FROM public.listings WHERE id = listing_id)
  );
CREATE POLICY "listing_images_delete_own_listing" ON public.listing_images 
  FOR DELETE USING (
    auth.uid() = (SELECT seller_id FROM public.listings WHERE id = listing_id)
  );

CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON public.listing_images(is_primary);

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
