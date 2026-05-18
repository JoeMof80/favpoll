/**
 * Migration script — Ubiquitous Language Audit
 * Runs SQL migrations via Supabase Management API
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Extract project ref from URL: https://kgwkpibkoecvwcundqtm.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0]

const migrations = [
  {
    name: 'Migration 1 — Rename persons to protagonists',
    sql: `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'persons') THEN
          ALTER TABLE persons RENAME TO protagonists;
          RAISE NOTICE 'Renamed persons to protagonists';
        ELSE
          RAISE NOTICE 'persons table does not exist (already renamed or not present)';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'person_id') THEN
          ALTER TABLE events RENAME COLUMN person_id TO protagonist_id;
          RAISE NOTICE 'Renamed events.person_id to protagonist_id';
        ELSE
          RAISE NOTICE 'events.person_id does not exist (already renamed)';
        END IF;

        ALTER TABLE events DROP CONSTRAINT IF EXISTS events_person_id_fkey;
        RAISE NOTICE 'Dropped events_person_id_fkey (if existed)';

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_schema = 'public' AND constraint_name = 'events_protagonist_id_fkey'
        ) THEN
          ALTER TABLE events ADD CONSTRAINT events_protagonist_id_fkey
            FOREIGN KEY (protagonist_id) REFERENCES protagonists(id);
          RAISE NOTICE 'Added events_protagonist_id_fkey constraint';
        ELSE
          RAISE NOTICE 'events_protagonist_id_fkey already exists';
        END IF;
      END $$;
    `,
  },
  {
    name: 'Migration 2 — Rename personal_quote to personal_reveal',
    sql: `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'event_polls' AND column_name = 'personal_quote') THEN
          ALTER TABLE event_polls RENAME COLUMN personal_quote TO personal_reveal;
          RAISE NOTICE 'Renamed event_polls.personal_quote to personal_reveal';
        ELSE
          RAISE NOTICE 'event_polls.personal_quote does not exist (already renamed)';
        END IF;
      END $$;
    `,
  },
  {
    name: 'Migration 3 — Rename is_master to is_canonical',
    sql: `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'topic_items' AND column_name = 'is_master') THEN
          ALTER TABLE topic_items RENAME COLUMN is_master TO is_canonical;
          RAISE NOTICE 'Renamed topic_items.is_master to is_canonical';
        ELSE
          RAISE NOTICE 'topic_items.is_master does not exist (already renamed)';
        END IF;
      END $$;
    `,
  },
  {
    name: 'Migration 4 — Rename graduate_topic_items function',
    sql: `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'graduate_topic_items') THEN
          ALTER FUNCTION graduate_topic_items() RENAME TO include_topic_items;
          RAISE NOTICE 'Renamed graduate_topic_items to include_topic_items';
        ELSE
          RAISE NOTICE 'graduate_topic_items function does not exist (already renamed)';
        END IF;
      END $$;
    `,
  },
]

async function runSqlViaManagementApi(sql: string): Promise<{ ok: boolean; error?: string }> {
  // Use Supabase Management API - requires project ref and PAT
  // But we only have service role key. Try the pg REST sql endpoint.
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

  // This requires a PAT. Alternative: use the pg REST proxy if available.
  // Let's try the database REST endpoint
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!response.ok) {
    const text = await response.text()
    return { ok: false, error: `HTTP ${response.status}: ${text}` }
  }

  return { ok: true }
}

async function runSqlViaRpcWrapper(sql: string): Promise<{ ok: boolean; error?: string }> {
  // Try calling via the Supabase REST RPC using a workaround
  // Some projects have pg_net or similar. Let's try.
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    const text = await response.text()
    return { ok: false, error: text }
  }

  return { ok: true }
}

void runSqlViaRpcWrapper

// Use pg package directly via connection string
// Supabase connection string format: postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres
// We need the DB password which is different from the service role key

// The approach: Use the Supabase REST API with a raw SQL capability
// The /rest/v1/ endpoint doesn't support raw SQL, but we can use the
// PostgREST RPC to call functions. Since we need to run DDL, we must
// use a different approach.

// FINAL APPROACH: Use fetch to the Supabase SQL endpoint via the project dashboard
// This requires the Management API with a PAT, which we don't have.

// WORKAROUND: Create a temporary PL/pgSQL function via PostgREST RPC
// by calling a helper that exists, then drop it.

// Actually the simplest approach: check if pnpm has pg installed
// and use a direct postgres connection

async function tryDirectPostgres() {
  // We know the project ref, Supabase uses the DB password separately from service role key
  // The Supabase dashboard URL pattern gives us the host
  const host = `db.${projectRef}.supabase.co`

  console.log(`Project ref: ${projectRef}`)
  console.log(`DB host would be: ${host}`)
  console.log('\nAttempting Management API approach...')

  const result = await runSqlViaManagementApi('SELECT 1')
  console.log('Management API result:', result)
}

tryDirectPostgres().catch(console.error)
