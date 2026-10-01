ALTER TABLE public.menfess
    ADD COLUMN IF NOT EXISTS url_gambar text;

CREATE TABLE IF NOT EXISTS public.menfess_image_deletions (
    menfess_id bigint PRIMARY KEY REFERENCES public.menfess(id) ON DELETE CASCADE,
    delete_url text NOT NULL
);

ALTER TABLE public.menfess_image_deletions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.menfess_image_deletions FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.menfess_image_upload_limits (
    ip_hash text PRIMARY KEY,
    last_upload_at timestamptz NOT NULL
);

ALTER TABLE public.menfess_image_upload_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.menfess_image_upload_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_image_upload_slot(p_ip_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    claimed boolean;
BEGIN
    INSERT INTO public.menfess_image_upload_limits (ip_hash, last_upload_at)
    VALUES (p_ip_hash, now())
    ON CONFLICT (ip_hash) DO UPDATE
    SET last_upload_at = now()
    WHERE public.menfess_image_upload_limits.last_upload_at < now() - interval '1 minute'
    RETURNING true INTO claimed;

    RETURN coalesce(claimed, false);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_image_upload_slot(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_image_upload_slot(text) TO service_role;