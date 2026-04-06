-- 既存の求職者にPT-XXXX IDを一括付与するバックフィルSQL
-- portal_login_idがNULLの求職者に、作成日順で連番を振る

-- まず現在の最大番号を確認
-- SELECT MAX(portal_login_id) FROM candidates WHERE portal_login_id IS NOT NULL;

-- バックフィル実行: portal_login_idがNULLの候補者に連番を付与
WITH max_num AS (
  SELECT COALESCE(
    MAX(
      CAST(SUBSTRING(portal_login_id FROM 'PT-(\d+)') AS INTEGER)
    ),
    0
  ) AS current_max
  FROM candidates
  WHERE portal_login_id IS NOT NULL
),
to_update AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM candidates
  WHERE portal_login_id IS NULL
    AND is_deleted = false
)
UPDATE candidates
SET portal_login_id = 'PT-' || LPAD(CAST((SELECT current_max FROM max_num) + tu.rn AS TEXT), 4, '0'),
    updated_at = NOW()
FROM to_update tu
WHERE candidates.id = tu.id;
