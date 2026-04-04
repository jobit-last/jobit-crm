-- candidate_status_histories ãã¼ãã«ä½æ
-- æ±è·èã®ã¹ãã¼ã¿ã¹å¤æ´å±¥æ­´ãè¨é²ãããã¼ãã«
-- Enhanced Dashboard ã®ãªã¼ãã¿ã¤ã è¨ç®ãã¬ã³ããã£ã¼ãã®ã¿ã¤ã ã©ã¤ã³è¡¨ç¤ºã«ä½¿ç¨

CREATE TABLE IF NOT EXISTS public.candidate_status_histories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ã¤ã³ããã¯ã¹ä½æ
CREATE INDEX IF NOT EXISTS idx_csh_candidate_id ON public.candidate_status_histories(candidate_id);
CREATE INDEX IF NOT EXISTS idx_csh_to_status ON public.candidate_status_histories(to_status);
CREATE INDEX IF NOT EXISTS idx_csh_changed_at ON public.candidate_status_histories(changed_at);
CREATE INDEX IF NOT EXISTS idx_csh_candidate_to_status ON public.candidate_status_histories(candidate_id, to_status);

-- RLS (Row Level Security) ããªã·ã¼
ALTER TABLE public.candidate_status_histories ENABLE ROW LEVEL SECURITY;

-- èªè¨¼ã¦ã¼ã¶ã¼ã¯å¨ã¬ã³ã¼ãèª­ã¿åãå¯è½
CREATE POLICY "Authenticated users can read status histories"
  ON public.candidate_status_histories
  FOR SELECT
  TO authenticated
  USING (true);

-- èªè¨¼ã¦ã¼ã¶ã¼ã¯ã¬ã³ã¼ãæ¿å¥å¯è½
CREATE POLICY "Authenticated users can insert status histories"
  ON public.candidate_status_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ã³ã¡ã³ã
COMMENT ON TABLE public.candidate_status_histories IS 'æ±è·èã¹ãã¼ã¿ã¹å¤æ´å±¥æ­´';
COMMENT ON COLUMN public.candidate_status_histories.candidate_id IS 'å¯¾è±¡æ±è·èã®ID';
COMMENT ON COLUMN public.candidate_status_histories.from_status IS 'å¤æ´åã®ã¹ãã¼ã¿ã¹';
COMMENT ON COLUMN public.candidate_status_histories.to_status IS 'å¤æ´å¾ã®ã¹ãã¼ã¿ã¹';
COMMENT ON COLUMN public.candidate_status_histories.changed_by IS 'å¤æ´ãè¡ã£ãã¦ã¼ã¶ã¼ã®ID';
COMMENT ON COLUMN public.candidate_status_histories.changed_at IS 'ã¹ãã¼ã¿ã¹å¤æ´æ¥æ';
