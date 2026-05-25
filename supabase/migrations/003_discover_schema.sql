-- Discovery layer: lightweight global catalogue + snapshots for homepage

CREATE TABLE discover_repositories (
  id BIGSERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT UNIQUE NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  avatar_url TEXT,
  html_url TEXT,
  discovered_from TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discover_history (
  id BIGSERIAL PRIMARY KEY,
  repository_id BIGINT NOT NULL REFERENCES discover_repositories(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL,
  forks INTEGER NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discover_repos_github_id ON discover_repositories(github_id);
CREATE INDEX idx_discover_repos_language ON discover_repositories(language);
CREATE INDEX idx_discover_repos_stars ON discover_repositories(stars DESC);
CREATE INDEX idx_discover_repos_last_seen ON discover_repositories(last_seen DESC);
CREATE INDEX idx_discover_history_repo_date ON discover_history(repository_id, collected_at DESC);
CREATE INDEX idx_discover_history_collected_at ON discover_history(collected_at DESC);

ALTER TABLE discover_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discover_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discover_repositories_select_public"
  ON discover_repositories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "discover_history_select_public"
  ON discover_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- Trending: star gain over last 24h from discover snapshots
CREATE OR REPLACE FUNCTION get_discover_trending_daily(p_limit INT DEFAULT 5)
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
  FROM discover_repositories r
  JOIN discover_history h ON h.repository_id = r.id
  WHERE h.collected_at >= NOW() - INTERVAL '1 day'
  GROUP BY r.id, r.owner, r.name, r.full_name, r.description, r.language
  HAVING COUNT(*) >= 2 AND MAX(h.stars) - MIN(h.stars) > 0
  ORDER BY stars_gain DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Growth % over 7 days from discover snapshots
CREATE OR REPLACE FUNCTION get_discover_growth_weekly(p_limit INT DEFAULT 5)
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
    FROM discover_history
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
  JOIN discover_repositories r ON r.id = g.repository_id
  WHERE g.new_stars > g.old_stars
  ORDER BY growth_percent DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Recently discovered / seen repos
CREATE OR REPLACE FUNCTION get_discover_recent(p_limit INT DEFAULT 5)
RETURNS TABLE (
  id BIGINT,
  github_id BIGINT,
  owner TEXT,
  name TEXT,
  full_name TEXT,
  description TEXT,
  language TEXT,
  stars INTEGER,
  forks INTEGER,
  last_seen TIMESTAMPTZ
) AS $$
  SELECT
    id,
    github_id,
    owner,
    name,
    full_name,
    description,
    language,
    stars,
    forks,
    last_seen
  FROM discover_repositories
  ORDER BY last_seen DESC NULLS LAST
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Language distribution across discovered repos
CREATE OR REPLACE FUNCTION get_discover_languages(p_limit INT DEFAULT 6)
RETURNS TABLE (language TEXT, total BIGINT) AS $$
  SELECT language, COUNT(*)::BIGINT AS total
  FROM discover_repositories
  WHERE language IS NOT NULL
  GROUP BY language
  ORDER BY total DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE;
