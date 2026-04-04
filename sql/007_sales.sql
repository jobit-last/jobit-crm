-- sales ãã¼ãã«ä½æ
-- ã3ãå£²ä¸ç®¡çæ©è½

CREATE TABLE IF NOT EXISTS public.sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ca_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  candidate_id uuid REFERENCES public.candidates(id) ON DELETE SET NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  amount integer NOT NULL DEFAULT 0,
  month text NOT NULL,  -- 'YYYY/MM' å½¢å¼
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at èªåæ´æ°ããªã¬ã¼
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ã¤ã³ããã¯ã¹
CREATE INDEX IF NOT EXISTS idx_sales_ca_id ON sales(ca_id);
CREATE INDEX IF NOT EXISTS idx_sales_month ON sales(month);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_candidate_id ON sales(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);

-- RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "èªè¨¼ã¦ã¼ã¶ã¼ã¯å£²ä¸ãé²è¦§å¯è½" ON sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "èªè¨¼ã¦ã¼ã¶ã¼ã¯å£²ä¸ãç»é²å¯è½" ON sales
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "èªè¨¼ã¦ã¼ã¶ã¼ã¯å£²ä¸ãæ´æ°å¯è½" ON sales
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "èªè¨¼ã¦ã¼ã¶ã¼ã¯å£²ä¸ãåé¤å¯è½" ON sales
  FOR DELETE TO authenticated USING (true);

-- ã³ã¡ã³ã
COMMENT ON TABLE sales IS 'å£²ä¸ç®¡çãã¼ãã«';
COMMENT ON COLUMN sales.ca_id IS 'æå½CAã®ã¦ã¼ã¶ã¼ID';
COMMENT ON COLUMN sales.candidate_id IS 'é¢é£æ±è·èID';
COMMENT ON COLUMN sales.company_id IS 'é¢é£ä¼æ¥­ID';
COMMENT ON COLUMN sales.amount IS 'å£²ä¸éé¡ï¼åï¼';
COMMENT ON COLUMN sales.month IS 'å£²ä¸å¯¾è±¡æ (YYYY/MM)';
COMMENT ON COLUMN sales.status IS 'å£²ä¸ã¹ãã¼ã¿ã¹ (pending/confirmed/paid/cancelled)';
