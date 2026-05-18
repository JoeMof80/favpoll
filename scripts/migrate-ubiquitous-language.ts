import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Run SQL via the pg REST endpoint using service role key
async function runSql(sql: string): Promise<void> {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  })
  // Supabase doesn't expose a generic SQL endpoint via REST directly.
  // Use the supabase-js client with rpc or direct fetch to the pg endpoint.
  void response
}

// Use the Supabase Management API to run SQL
// Actually, let's check if we can use a stored procedure or the pg REST endpoint
// The correct approach is to use the database URL directly

// Let's try via PostgREST sql endpoint (not standard) — use a workaround
// by creating a migration function temporarily, or use the database URL

async function execViaRpc(sql: string): Promise<{ ok: boolean; error?: string }> {
  // PostgREST doesn't have a generic SQL endpoint, but we can use
  // the Supabase postgres URL if available, or we need to use the management API
  // Let's try to detect if there's a postgres direct connection available

  // Alternative: use fetch to the Supabase pg connection endpoint
  const pgUrl = supabaseUrl.replace('https://', 'postgresql://postgres:')
  void pgUrl

  // The simplest approach that works: use supabase's built-in REST
  // by calling a function. But we don't have exec_sql.
  // Let's use node-postgres directly via the connection string format.

  console.log(`Would run: ${sql.substring(0, 80)}...`)
  return { ok: false, error: 'No direct SQL endpoint available' }
}

void execViaRpc

// Use fetch to the Supabase SQL endpoint (only available via management API or direct pg)
// Let's check if there's a DATABASE_URL in env
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!dbUrl) {
  console.log('No DATABASE_URL found. Running migrations via Supabase REST workaround.')
  console.log('Supabase URL:', supabaseUrl)
}

// The correct way to run arbitrary SQL in Supabase without the CLI is via
// the database connection string using pg or postgres package.
// Let's use the Supabase management API via fetch

async function runMigrationViaManagementAPI(sql: string): Promise<void> {
  // Supabase management API requires a personal access token, not service role key
  // This won't work with service role key

  // Alternative: Use the supabase client to call a function that runs SQL
  // We need to create such a function first via the dashboard, or
  // use the postgres connection string directly

  // The project ref is: kgwkpibkoecvwcundqtm (from the URL)
  const projectRef = 'kgwkpibkoecvwcundqtm'
  void projectRef
  void sql
}

void runMigrationViaManagementAPI

// Best approach without CLI: use node's https directly to pg's wire protocol
// OR: install @supabase/supabase-js and use a workaround
// Actually the cleanest approach is to use the REST API to call a SQL function
// Let's create the function first via RPC then use it

// WORKAROUND: Use the Supabase SQL editor API endpoint
// This requires authentication via dashboard token which we don't have.

// FINAL APPROACH: Write raw SQL to a file and instruct running via psql
// OR: Use the fetch API to hit the Supabase database directly

// Actually, looking at the Supabase docs, the service role key CAN be used
// to call stored procedures. The exec_sql function just doesn't exist.
// Let's try creating it first.

async function bootstrap() {
  console.log('Attempting to bootstrap exec_sql function...')

  // Check what tables exist
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')

  if (error) {
    console.log('Cannot query information_schema via PostgREST (expected):', error.message)
  } else {
    console.log('Tables:', tables)
  }

  // Let's try the RPC approach to check current state
  // Use a simple function that should exist
  console.log('\nChecking current table state...')

  // Try querying persons table
  const { data: persons, error: personsError } = await supabase
    .from('persons')
    .select('id')
    .limit(1)

  if (personsError) {
    console.log('persons table:', personsError.message)
  } else {
    console.log('persons table exists, rows:', persons?.length)
  }

  // Try querying protagonists table
  const { data: protagonists, error: protagonistsError } = await supabase
    .from('protagonists')
    .select('id')
    .limit(1)

  if (protagonistsError) {
    console.log('protagonists table:', protagonistsError.message)
  } else {
    console.log('protagonists table exists, rows:', protagonists?.length)
  }

  // Check event_polls columns
  const { data: poll, error: pollError } = await supabase
    .from('event_polls')
    .select('personal_quote, personal_reveal')
    .limit(1)

  if (pollError) {
    console.log('event_polls column check:', pollError.message)
  } else {
    console.log('event_polls: personal_quote/personal_reveal check passed')
  }
}

bootstrap().catch(console.error)
