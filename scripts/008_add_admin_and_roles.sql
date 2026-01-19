-- Add admin_role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_data JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspicious_activity_flag BOOLEAN DEFAULT false;

-- Create admin logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_logs_select_own_or_admin" ON public.admin_logs 
  FOR SELECT USING (auth.uid() = admin_id OR (SELECT admin_role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Create moderation queue table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  reported_by_user_id UUID REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_to_admin UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moderation_queue_select_admin" ON public.moderation_queue 
  FOR SELECT USING ((SELECT admin_role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

CREATE INDEX idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_queue_created_at ON public.moderation_queue(created_at DESC);
