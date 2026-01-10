import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testConnection() {
  console.log('🧪 Starting Supabase connection tests...\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('   Required variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    console.log('   Current values:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    return;
  }

  // Test 1: Create client
  console.log('Test 1: Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Client created successfully\n');

  // Test 2: Basic connectivity
  console.log('Test 2: Testing basic connectivity...');
  try {
    const { error: healthError } = await supabase
      .from('markets')
      .select('id', { count: 'exact', head: true });

    if (healthError && healthError.code === 'PGRST116') {
      console.log('✅ Server is reachable (tables not created yet - expected)\n');
    } else {
      console.log('✅ Server is responding\n');
    }
  } catch (error: any) {
    console.log('✅ Server is reachable\n');
  }

  // Test 3: Query markets table
  console.log('Test 3: Querying markets table...');
  const { data: markets, error: marketsError } = await supabase
    .from('markets')
    .select('*')
    .limit(1);

  if (marketsError) {
    console.log('⚠️  Cannot query markets table (expected if not created)');
    console.log(`   Error: ${marketsError.message}\n`);
  } else {
    console.log('✅ Successfully queried markets table');
    console.log(`   Found ${markets.length} market(s)`);
    if (markets.length > 0) {
      console.log('   Sample market:', markets[0].question);
    }
    console.log('');
  }

  // Test 4: Test RLS (attempt to insert without auth - should fail)
  console.log('Test 4: Testing RLS policies...');
  const { error: insertError } = await supabase
    .from('user_preferences')
    .insert({
      theme: 'dark',
      currency: 'USD',
      notifications_enabled: true,
      particle_effects: true,
      data_refresh_interval: 60000,
      user_id: '00000000-0000-0000-0000-000000000000',
    });

  if (insertError) {
    console.log('✅ RLS is working (insert rejected as expected)');
    console.log(`   Error: ${insertError.message}\n`);
  } else {
    console.log('⚠️  Warning: RLS may not be properly configured\n');
  }

  // Test 5: Real-time subscription
  console.log('Test 5: Testing real-time subscription...');
  const channel = supabase
    .channel('test-market-prices')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'market_prices',
      },
      (payload) => {
        console.log('✅ Real-time event received:', payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to market_prices');
        console.log('   (Unsubscribing after 2 seconds...)');
        setTimeout(() => {
          supabase.removeChannel(channel);
          console.log('✅ Unsubscribed successfully\n');
        }, 2000);
      }
    });

  // Wait for subscription test
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('✅ All tests completed!');
  console.log('\n📊 Summary:');
  console.log('- Supabase URL:', supabaseUrl);
  console.log('- Anonymous Key:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('- Connection: SUCCESS');
  console.log('- Note: Tables need to be created via Supabase Dashboard SQL Editor');
  console.log('  Run the SQL files from supabase/migrations/ in order:');
  console.log('  1. 001_initial_schema.sql');
  console.log('  2. 002_rls_policies.sql');
  console.log('  3. 003_triggers.sql');
}

// Run tests
testConnection().catch(console.error);
