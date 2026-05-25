-- Cache minimal : repos visités + dernier snapshot REST (sans historique série)

CREATE TABLE IF NOT EXISTS tracked_repositories (
  id BIGSERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT UNIQUE NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tracked_repos_synced ON tracked_repositories(synced_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tracked_repos_stars ON tracked_repositories(stars DESC);

ALTER TABLE tracked_repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_repositories_select_public"
  ON tracked_repositories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Migration optionnelle depuis l’ancienne table repositories
INSERT INTO tracked_repositories (
  github_id, owner, name, full_name, description, language,
  stars, forks, watchers, open_issues, created_at, updated_at, synced_at
)
SELECT
  github_id, owner, name, full_name, description, language,
  stars, forks, watchers, open_issues, created_at, updated_at, last_synced_at
FROM repositories
ON CONFLICT (github_id) DO NOTHING;
