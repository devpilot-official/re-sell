-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_methods_select_own" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_insert_own" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_methods_update_own" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_delete_own" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Create user preferences table for multi-language and currency
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'en',
  preferred_currency TEXT DEFAULT 'NGN',
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,
  receive_promotions BOOLEAN DEFAULT true,
  receive_messages BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create security audit logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  event_description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "security_audit_logs_select_own_or_admin" ON public.security_audit_logs 
  FOR SELECT USING (auth.uid() = user_id OR (SELECT admin_role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
