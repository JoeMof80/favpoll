'use strict'

const pg = require('pg')
const { Client } = pg

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd2twaWJrb2VjdndjdW5kcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI2OTUyNCwiZXhwIjoyMDkzODQ1NTI0fQ.orpiTZrujHWuLg9InnEiETN5yD-09SL7HBta9T7FIoY'
const PROJECT_REF = 'kgwkpibkoecvwcundqtm'

const REGIONS = ['eu-west-2', 'us-east-1', 'us-west-1', 'ap-southeast-1', 'ap-northeast-1']

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
          RAISE NOTICE 'persons table does not exist (already renamed)';
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'person_id') THEN
          ALTER TABLE events RENAME COLUMN person_id TO protagonist_id;
          RAISE NOTICE 'Renamed events.person_id to protagonist_id';
        ELSE
          RAISE NOTICE 'events.person_id does not exist (already renamed)';
        END IF;

        ALTER TABLE events DROP CONSTRAINT IF EXISTS events_person_id_fkey;

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

async function tryConnect(host, port) {
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })

  try {
    await client.connect()
    console.log(`Connected to ${host}:${port}`)
    return client
  } catch (err) {
    console.log(`Failed ${host}:${port}: ${err.message}`)
    return null
  }
}

async function main() {
  let client = null

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`
    // Try session pooler (5432) for DDL
    client = await tryConnect(host, 5432)
    if (client) break
  }

  if (!client) {
    console.error('Could not connect to database. All connection attempts failed.')
    process.exit(1)
  }

  for (const migration of migrations) {
    console.log(`\nRunning: ${migration.name}`)
    try {
      await client.query(migration.sql)
      console.log(`  SUCCESS`)
    } catch (err) {
      console.error(`  FAILED: ${err.message}`)
    }
  }

  await client.end()
  console.log('\nAll migrations complete.')
}

main().catch(console.error)
