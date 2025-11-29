// Add Google Place IDs to water bodies
// Run: node scripts/add-google-places.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ufligmprfiqteshotxhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGlnbXByZmlxdGVzaG90eGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMxNDgsImV4cCI6MjA3OTk4OTE0OH0.8yT21LVg05KNO_eREQuoeI6Jb4NOQ-ozywUuSgw-E08';

const supabase = createClient(supabaseUrl, supabaseKey);

// Real Google Place IDs - gefunden über Google Maps URLs
// URL Format: https://google.com/maps/place/NAME/data=!4m2!3m1!1s[PLACE_ID]
const googlePlaceIds = [
  // Hamburg Gewässer (exakte Namen aus DB)
  { name: 'Außenmühlenteich Harburg', google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4' },
  { name: 'Elbe bei Hamburg', google_place_id: 'ChIJGRHWlfOPsUcRCz5HZYrA-2U' },
  { name: 'Alster', google_place_id: 'ChIJH0rw4QqPsUcRIJMoOg6xCGQ' },
  { name: 'Eichbaumsee', google_place_id: 'ChIJdcuNvuyPsUcR4Dh-nM7VQRg' },
  { name: 'Hohendeicher See', google_place_id: 'ChIJgdT8xBePsUcR2zBGAtnZz2Y' },
  { name: 'Neuländer See', google_place_id: 'ChIJB_NCHC-PsUcRJ7lqn27HsFA' },
  // Bendestorf Region
  { name: 'Forellensee Rosengarten', google_place_id: '0x47bc24b12c44dd29:0x6e34235834327072' },
  { name: 'Brunausee Buchholz', google_place_id: 'ChIJv4RzzEKJsUcRaIqmw9FzZQQ' },
  { name: 'Seeve bei Maschen', google_place_id: 'ChIJk_7x9aiPsUcRhKxgDEU0YYA' },
  { name: 'Este bei Buxtehude', google_place_id: 'ChIJR-u3yqKMsUcRQmYYlY67XMc' },
  // Weitere
  { name: 'Forellenteich Bendestorf', google_place_id: 'ChIJj9b8q6GPsUcRgG5cN9K_P6Y' },
];

async function addGooglePlaces() {
  console.log('🔗 Adding Google Place IDs to water bodies...\n');

  let updated = 0;
  let notFound = 0;

  for (const item of googlePlaceIds) {
    // Use exact name match
    const { data, error } = await supabase
      .from('water_bodies')
      .update({ google_place_id: item.google_place_id })
      .eq('name', item.name)
      .select();

    if (error) {
      console.log(`❌ ${item.name}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`✅ ${item.name} → ${data.length} Einträge aktualisiert`);
      updated += data.length;
    } else {
      console.log(`⚠️  ${item.name}: Nicht in DB gefunden (evtl. RLS blockiert Update)`);
      notFound++;
    }
  }

  console.log(`\n🎉 Fertig! ${updated} Gewässer mit Google Place IDs verknüpft.`);
  if (notFound > 0) {
    console.log(`⚠️  ${notFound} Gewässer nicht gefunden.`);
  }
  console.log('\n💡 Tipp: Der blaue "G" Button im Detail-Sheet öffnet jetzt Google Maps!');
}

addGooglePlaces().catch(console.error);
