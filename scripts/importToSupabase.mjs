/**
 * BISS Data Import to Supabase
 * Imports water bodies from JSON to Supabase
 * Run with: node scripts/importToSupabase.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Config - Use your env variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment');
  console.log('   Set them with:');
  console.log('   export EXPO_PUBLIC_SUPABASE_URL=your_url');
  console.log('   export EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  BISS Supabase Import');
  console.log('═══════════════════════════════════════════════════\n');

  // Load data
  const dataFile = path.join(__dirname, '../data/niedersachsen-water-bodies.json');
  
  if (!fs.existsSync(dataFile)) {
    console.error('❌ Data file not found:', dataFile);
    console.log('   Run: node scripts/fetchWaterBodies.mjs first');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const waterBodies = data.waterBodies;

  console.log(`📄 Loaded ${waterBodies.length} water bodies from JSON`);
  console.log('🚀 Starting import to Supabase...\n');

  // Import in batches of 50
  const batchSize = 50;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < waterBodies.length; i += batchSize) {
    const batch = waterBodies.slice(i, i + batchSize);
    
    // Transform for Supabase (ensure correct types)
    const records = batch.map(wb => ({
      id: wb.id,
      name: wb.name,
      type: wb.type,
      latitude: wb.latitude,
      longitude: wb.longitude,
      region: wb.region,
      fish_species: wb.fish_species,
      permit_price: wb.permit_price,
      permit_required: wb.permit_required,
      is_assumed: wb.is_assumed,
    }));

    try {
      const { data, error } = await supabase
        .from('water_bodies')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Batch ${i}-${i + batch.length} error:`, error.message);
        errors += batch.length;
      } else {
        console.log(`✅ Imported batch ${i + 1}-${i + batch.length}`);
        imported += batch.length;
      }
    } catch (err) {
      console.error(`❌ Batch error:`, err.message);
      errors += batch.length;
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  IMPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Imported: ${imported}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📊 Total: ${waterBodies.length}`);
}

main();
