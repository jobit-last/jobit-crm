-- candidates ãã¼ãã«ã«äººå£çµ±è¨åæç¨ã«ã©ã ãè¿½å 
-- ã4ãããã·ã¥ãã¼ã æ°å¤åæã®12æ¬¡åè¿½å 

-- çµé¨å¹´æ°
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years integer;

-- æçµå­¦æ­´
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS education text CHECK (education IN ('ä¸­å­¦æ ¡', 'é«æ ¡', 'å°éå­¦æ ¡', 'ç­å¤§', 'å¤§å­¦', 'å¤§å­¦é¢', 'ãã®ä»'));

-- å±ä½å°ï¼é½éåºçï¼
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS residence text;

-- ã¢ã¯ãã£ãç¶æï¼è»¢è·æ´»åä¸­ãã©ããï¼
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- ä»ç¤¾ã¨ã¼ã¸ã§ã³ãå©ç¨
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS other_agent text CHECK (other_agent IN ('ãªã', 'ããï¼1ç¤¾ï¼', 'ããï¼2ç¤¾ä»¥ä¸ï¼', 'ä¸æ'));

-- æ¢å¾æ­´æç¡
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS medical_history text CHECK (medical_history IN ('ãªã', 'ãã', 'æªç¢ºèª'));

-- æçåºå
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS arts_science text CHECK (arts_science IN ('æç³»', 'çç³»', 'ãã®ä»', 'æªè¨­å®'));

-- å¸æè·ç¨®
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_occupation text;

-- ã¿ã¤ãï¼è²åé¡ï¼
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS personality_color text CHECK (personality_color IN ('èµ¤', 'é', 'é»', 'ç·', 'æªè¨­å®'));

-- å¸æéç¨å½¢æ
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS desired_employment_type text CHECK (desired_employment_type IN ('æ­£ç¤¾å¡', 'å¥ç´ç¤¾å¡', 'æ´¾é£ç¤¾å¡', 'ãã¼ãã»ã¢ã«ãã¤ã', 'æ¥­åå§è¨', 'æªè¨­å®'));

-- è»¢å±å¯å¦
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS relocation_willingness text CHECK (relocation_willingness IN ('å¯', 'ä¸å¯', 'æ¡ä»¶æ¬¡ç¬¬', 'æªç¢ºèª'));

-- ä¼è©±éã¹ã³ã¢ï¼1-10ï¼
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS conversation_score integer CHECK (conversation_score >= 1 AND conversation_score <= 10);

-- ã¤ã³ããã¯ã¹
CREATE INDEX IF NOT EXISTS idx_candidates_education ON candidates(education);
CREATE INDEX IF NOT EXISTS idx_candidates_residence ON candidates(residence);
CREATE INDEX IF NOT EXISTS idx_candidates_is_active ON candidates(is_active);
CREATE INDEX IF NOT EXISTS idx_candidates_arts_science ON candidates(arts_science);

-- ã³ã¡ã³ã
COMMENT ON COLUMN candidates.experience_years IS 'çµé¨å¹´æ°';
COMMENT ON COLUMN candidates.education IS 'æçµå­¦æ­´';
COMMENT ON COLUMN candidates.residence IS 'å±ä½å°ï¼é½éåºçï¼';
COMMENT ON COLUMN candidates.is_active IS 'è»¢è·æ´»åã¢ã¯ãã£ãç¶æ';
COMMENT ON COLUMN candidates.other_agent IS 'ä»ç¤¾ã¨ã¼ã¸ã§ã³ãå©ç¨ç¶æ³';
COMMENT ON COLUMN candidates.medical_history IS 'æ¢å¾æ­´æç¡';
COMMENT ON COLUMN candidates.arts_science IS 'æçåºå';
COMMENT ON COLUMN candidates.desired_occupation IS 'å¸æè·ç¨®';
COMMENT ON COLUMN candidates.personality_color IS 'ã¿ã¤ãï¼è²åé¡ï¼';
COMMENT ON COLUMN candidates.desired_employment_type IS 'å¸æéç¨å½¢æ';
COMMENT ON COLUMN candidates.relocation_willingness IS 'è»¢å±å¯å¦';
COMMENT ON COLUMN candidates.conversation_score IS 'ä¼è©±éã¹ã³ã¢ï¼1-10ï¼';
