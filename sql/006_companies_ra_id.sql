-- companies ãã¼ãã«ã«æå½RA (ra_id) ã«ã©ã ãè¿½å 
-- ã2ãä¼æ¥­ç®¡çã®æ©è½è¿½å 

ALTER TABLE companies ADD COLUMN IF NOT EXISTS ra_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ã¤ã³ããã¯ã¹
CREATE INDEX IF NOT EXISTS idx_companies_ra_id ON companies(ra_id);

-- ã³ã¡ã³ã
COMMENT ON COLUMN companies.ra_id IS 'æå½RAã®ã¦ã¼ã¶ã¼ID';
