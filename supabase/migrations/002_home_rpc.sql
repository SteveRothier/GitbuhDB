-- RPC functions for homepage cards (trending, growth, languages)

CREATE OR REPLACE FUNCTION get_trending_daily(p_limit INT DEFAULT 5)
RETURNS TABLE (
  id BIGINT,
  owner TEXT,
  name TEXT,
  full_name TEXT,
  description TEXT,
  language TEXT,
  stars INTEGER,
  stars_gain INTEGER
) AS $$
  SELECT
    r.id,
    r.owner,
    r.name,
    r.full_name,
    r.description,
    r.language,
    MAX(h.stars)::INTEGER AS stars,
    (MAX(h.stars) - MIN(h.stars))::INTEGER AS stars_gain
  FROM repositories r
  JOIN repository_history h ON h.repository_id = r.id
  WHERE h.collected_at >= NOW() - INTERVAL '1 day'
  GROUP BY r.id, r.owner, r.name, r.full_name, r.description, r.language
  HAVING MAX(h.stars) - MIN(h.stars) > 0
  ORDER BY stars_gain DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_growth_weekly(p_limit INT DEFAULT 5)
RETURNS TABLE (
  id BIGINT,
  owner TEXT,
  name TEXT,
  full_name TEXT,
  description TEXT,
  language TEXT,
  stars INTEGER,
  growth_percent NUMERIC
) AS $$
  WITH growth AS (
    SELECT
      repository_id,
      MIN(stars) AS old_stars,
      MAX(stars) AS new_stars
    FROM repository_history
    WHERE collected_at >= NOW() - INTERVAL '7 days'
    GROUP BY repository_id
    HAVING COUNT(*) >= 2
  )
  SELECT
    r.id,
    r.owner,
    r.name,
    r.full_name,
    r.description,
    r.language,
    g.new_stars::INTEGER AS stars,
    ROUND(
      ((g.new_stars - g.old_stars)::NUMERIC / NULLIF(g.old_stars, 0)) * 100,
      1
    ) AS growth_percent
  FROM growth g
  JOIN repositories r ON r.id = g.repository_id
  WHERE g.new_stars > g.old_stars
  ORDER BY growth_percent DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_popular_languages(p_limit INT DEFAULT 6)
RETURNS TABLE (language TEXT, total BIGINT) AS $$
  SELECT language, COUNT(*)::BIGINT AS total
  FROM repositories
  WHERE language IS NOT NULL
  GROUP BY language
  ORDER BY total DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

CREATE INDEX IF NOT EXISTS idx_history_collected_at
  ON repository_history(collected_at DESC);
