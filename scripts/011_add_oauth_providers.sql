-- Create oauth_accounts table for social login
CREATE TABLE IF NOT EXISTS public.oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  raw_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

ALTER TABLE public.oauth_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oauth_accounts_select_own" ON public.oauth_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "oauth_accounts_insert_own" ON public.oauth_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_oauth_accounts_user_id ON public.oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON public.oauth_accounts(provider);
