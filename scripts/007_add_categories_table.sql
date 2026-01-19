-- Create a categories table for flexible, scalable item categorization
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- Insert initial categories for multiple item types
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
('Fashion', 'fashion', 'Clothing, shoes, accessories', '👗', 1),
('Electronics', 'electronics', 'Phones, laptops, gadgets', '📱', 2),
('Home & Living', 'home-living', 'Furniture, decor, kitchenware', '🏠', 3),
('Sports & Outdoors', 'sports', 'Sports equipment, outdoor gear', '⚽', 4),
('Books & Media', 'books', 'Books, movies, music', '📚', 5),
('Toys & Games', 'toys', 'Children toys, board games', '🎮', 6),
('Beauty & Health', 'beauty', 'Skincare, makeup, wellness', '💄', 7),
('Automotive', 'automotive', 'Car accessories, parts', '🚗', 8),
('Jewelry & Watches', 'jewelry', 'Rings, necklaces, timepieces', '⌚', 9),
('Other', 'other', 'Miscellaneous items', '📦', 10)
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
