-- Agrégats discovery sur 24h + fenêtre précédente (pour %) + série horaire (volume de collectes)

CREATE OR REPLACE FUNCTION get_discover_activity_24h()
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
WITH b AS (
  SELECT
    NOW() AS now_ts,
    NOW() - INTERVAL '24 hours' AS cur_start,
    NOW() - INTERVAL '48 hours' AS prev_start,
    NOW() - INTERVAL '24 hours' AS prev_end
),
last_col AS (
  SELECT MAX(h.collected_at) AS m
  FROM discover_history h
),
cur_repo AS (
  SELECT COUNT(DISTINCT h.repository_id)::bigint AS v
  FROM discover_history h, b
  WHERE h.collected_at >= b.cur_start
),
cur_meas AS (
  SELECT COUNT(*)::bigint AS v
  FROM discover_history h, b
  WHERE h.collected_at >= b.cur_start
),
cur_dstars AS (
  SELECT COALESCE(SUM(GREATEST(g, 0)), 0)::bigint AS v
  FROM (
    SELECT MAX(h.stars) - MIN(h.stars) AS g
    FROM discover_history h, b
    WHERE h.collected_at >= b.cur_start
    GROUP BY h.repository_id
    HAVING COUNT(*) >= 2
  ) q
),
cur_dforks AS (
  SELECT COALESCE(SUM(GREATEST(g, 0)), 0)::bigint AS v
  FROM (
    SELECT MAX(h.forks) - MIN(h.forks) AS g
    FROM discover_history h, b
    WHERE h.collected_at >= b.cur_start
    GROUP BY h.repository_id
    HAVING COUNT(*) >= 2
  ) q
),
prev_repo AS (
  SELECT COUNT(DISTINCT h.repository_id)::bigint AS v
  FROM discover_history h, b
  WHERE h.collected_at >= b.prev_start AND h.collected_at < b.prev_end
),
prev_meas AS (
  SELECT COUNT(*)::bigint AS v
  FROM discover_history h, b
  WHERE h.collected_at >= b.prev_start AND h.collected_at < b.prev_end
),
prev_dstars AS (
  SELECT COALESCE(SUM(GREATEST(g, 0)), 0)::bigint AS v
  FROM (
    SELECT MAX(h.stars) - MIN(h.stars) AS g
    FROM discover_history h, b
    WHERE h.collected_at >= b.prev_start AND h.collected_at < b.prev_end
    GROUP BY h.repository_id
    HAVING COUNT(*) >= 2
  ) q
),
prev_dforks AS (
  SELECT COALESCE(SUM(GREATEST(g, 0)), 0)::bigint AS v
  FROM (
    SELECT MAX(h.forks) - MIN(h.forks) AS g
    FROM discover_history h, b
    WHERE h.collected_at >= b.prev_start AND h.collected_at < b.prev_end
    GROUP BY h.repository_id
    HAVING COUNT(*) >= 2
  ) q
),
hourly AS (
  SELECT
    gs.hr,
    COALESCE(c.cnt, 0)::bigint AS cnt
  FROM (
    SELECT generate_series(
      date_trunc('hour', (SELECT now_ts FROM b)) - INTERVAL '23 hours',
      date_trunc('hour', (SELECT now_ts FROM b)),
      INTERVAL '1 hour'
    ) AS hr
  ) gs
  LEFT JOIN (
    SELECT
      date_trunc('hour', h.collected_at) AS hr,
      COUNT(*)::bigint AS cnt
    FROM discover_history h, b
    WHERE h.collected_at >= b.cur_start
    GROUP BY 1
  ) c ON c.hr = gs.hr
)
SELECT jsonb_build_object(
  'current', jsonb_build_object(
    'repos_actifs', (SELECT v FROM cur_repo),
    'mesures', (SELECT v FROM cur_meas),
    'delta_stars', (SELECT v FROM cur_dstars),
    'delta_forks', (SELECT v FROM cur_dforks)
  ),
  'previous', jsonb_build_object(
    'repos_actifs', (SELECT v FROM prev_repo),
    'mesures', (SELECT v FROM prev_meas),
    'delta_stars', (SELECT v FROM prev_dstars),
    'delta_forks', (SELECT v FROM prev_dforks)
  ),
  'series', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'hour', hr,
          'count', cnt
        )
        ORDER BY hr
      )
      FROM hourly
    ),
    '[]'::jsonb
  ),
  'last_collected_at', (SELECT m FROM last_col)
);
$$;
