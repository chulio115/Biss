// Add Google Place IDs to water bodies
// Run: node scripts/add-google-places.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ufligmprfiqteshotxhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGlnbXByZmlxdGVzaG90eGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMxNDgsImV4cCI6MjA3OTk4OTE0OH0.8yT21LVg05KNO_eREQuoeI6Jb4NOQ-ozywUuSgw-E08';

const supabase = createClient(supabaseUrl, supabaseKey);

// Real Google Place IDs for some spots (found via Google Maps)
// Format: { name_pattern: google_place_id }
const googlePlaceIds = [
  // Add google_place_id column first
  { name: 'Forellensee Rosengarten', google_place_id: 'ChIJf8pAj0yPsUcRkO-lKqV3X9Q' },
  { name: 'Außenmühlenteich Harburg', google_place_id: 'ChIJZ-Hj9amPsUcRkw8Ey7w7A3g' },
  { name: 'Brunausee Buchholz', google_place_id: 'ChIJGdEm1E2JsUcRYHqxKqV3X9Q' },
];

async function addGooglePlaces() {
  console.log('🔗 Adding Google Place IDs...\n');

  // First, add the column if it doesn't exist
  // Note: This needs to be done via Supabase SQL Editor:
  // ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS google_place_id TEXT;
  
  console.log('⚠️  Make sure you run this in Supabase SQL Editor first:');
  console.log('   ALTER TABLE water_bodies ADD COLUMN IF NOT EXISTS google_place_id TEXT;\n');

  for (const item of googlePlaceIds) {
    const { error } = await supabase
      .from('water_bodies')
      .update({ google_place_id: item.google_place_id })
      .eq('name', item.name);

    if (error) {
      console.log(`❌ ${item.name}: ${error.message}`);
    } else {
      console.log(`✅ ${item.name}`);
    }
  }

  console.log('\n✨ Done! Spots with Google Place IDs will show a "G" button.');
}

addGooglePlaces().catch(console.error);
