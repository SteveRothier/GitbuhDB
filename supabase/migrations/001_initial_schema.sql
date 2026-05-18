CREATE TABLE repositories (
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
  last_synced_at TIMESTAMPTZ
);

CREATE TABLE repository_history (
  id BIGSERIAL PRIMARY KEY,
  repository_id BIGINT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL,
  forks INTEGER NOT NULL,
  watchers INTEGER NOT NULL,
  open_issues INTEGER DEFAULT 0,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_repo_date ON repository_history(repository_id, collected_at DESC);
CREATE INDEX idx_repos_language ON repositories(language);
CREATE INDEX idx_repos_stars ON repositories(stars DESC);

-- Lecture publique (MVP sans comptes utilisateurs)
CREATE POLICY "repositories_select_public"
  ON repositories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "repository_history_select_public"
  ON repository_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- Pas de INSERT/UPDATE/DELETE pour anon :
-- le cron et l'API Next.js utilisent SUPABASE_SERVICE_ROLE_KEY (bypass RLS)