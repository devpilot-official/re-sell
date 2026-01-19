-- Create listing_images table for multiple images per listing
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Listing images RLS policies
CREATE POLICY "listing_images_select_public" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "listing_images_insert_own" ON public.listing_images FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );
CREATE POLICY "listing_images_delete_own" ON public.listing_images FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE id = listing_id AND seller_id = auth.uid()
    )
  );

CREATE INDEX idx_listing_images_listing_id ON public.listing_images(listing_id);
