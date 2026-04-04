-- knowledge ãã¼ãã«æ¡å¼µ: æ±è·èç´ã¥ãã»é¸èçµæè¨é²
-- ã1ããã¬ãã¸ç®¡çã®æ©è½è¿½å 

-- æ±è·èç´ã¥ã
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS candidate_id uuid REFERENCES candidates(id) ON DELETE SET NULL;

-- ä¼æ¥­ç´ã¥ãï¼é¸èçµæã®ä¼æ¥­ï¼
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

-- é¸èçµæã¿ã¤ã (åå®, ä¸åæ ¼, è¾é, éä¸­è¾é)
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS selection_result text CHECK (selection_result IN ('offered', 'rejected', 'declined', 'withdrawn'));

-- é¸èçµæã®çç±ã»è¦å 
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS result_reason text;

-- ã«ãã´ãªã«ãé¸èçµæããè¿½å 
ALTER TABLE knowledge DROP CONSTRAINT IF EXISTS knowledge_category_check;
ALTER TABLE knowledge ADD CONSTRAINT knowledge_category_check
  CHECK (category IN ('é¢æ¥å¯¾ç­', 'ä¼æ¥­æå ±', 'æ¥­çæå ±', 'æ¥­åããã¥ã¢ã«', 'é¸èçµæ'));

-- ã¤ã³ããã¯ã¹
CREATE INDEX IF NOT EXISTS idx_knowledge_candidate_id ON knowledge(candidate_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_company_id ON knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_selection_result ON knowledge(selection_result);

-- ã³ã¡ã³ã
COMMENT ON COLUMN knowledge.candidate_id IS 'ç´ã¥ãæ±è·èID';
COMMENT ON COLUMN knowledge.company_id IS 'é¸èåä¼æ¥­ID';
COMMENT ON COLUMN knowledge.selection_result IS 'é¸èçµæã¿ã¤ã (offered/rejected/declined/withdrawn)';
COMMENT ON COLUMN knowledge.result_reason IS 'é¸èçµæã®çç±ã»è¦å ';
