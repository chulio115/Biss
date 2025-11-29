// Database Seeding Script - Run once to populate water bodies
// Usage: node scripts/seed-database.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ufligmprfiqteshotxhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGlnbXByZmlxdGVzaG90eGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMxNDgsImV4cCI6MjA3OTk4OTE0OH0.8yT21LVg05KNO_eREQuoeI6Jb4NOQ-ozywUuSgw-E08';

const supabase = createClient(supabaseUrl, supabaseKey);

// Teiche für Region Bendestorf/Hamburg-Süd/Niedersachsen
const waterBodies = [
  // Echte Gewässer
  { name: 'Forellensee Rosengarten', type: 'teich', latitude: 53.3847, longitude: 9.9217, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling', 'Stör'], requires_permit: true, permit_price: 25.00, is_assumed: false },
  { name: 'Angelteich Hittfeld', type: 'teich', latitude: 53.4012, longitude: 9.8756, region: 'Niedersachsen', fish_species: ['Karpfen', 'Schleie', 'Forelle'], requires_permit: true, permit_price: 18.00, is_assumed: false },
  { name: 'Karpfenteich Meckelfeld', type: 'teich', latitude: 53.4234, longitude: 10.0123, region: 'Niedersachsen', fish_species: ['Karpfen', 'Brassen', 'Rotauge'], requires_permit: true, permit_price: 15.00, is_assumed: false },
  { name: 'Seeve bei Maschen', type: 'fluss', latitude: 53.4156, longitude: 10.0456, region: 'Niedersachsen', fish_species: ['Forelle', 'Äsche', 'Döbel'], requires_permit: true, permit_price: 12.00, is_assumed: false },
  { name: 'Außenmühlenteich Harburg', type: 'teich', latitude: 53.4589, longitude: 9.9823, region: 'Hamburg', fish_species: ['Karpfen', 'Hecht', 'Barsch'], requires_permit: true, permit_price: 20.00, is_assumed: false },
  { name: 'Forellenhof Egestorf', type: 'teich', latitude: 53.2456, longitude: 9.8234, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling', 'Lachs'], requires_permit: true, permit_price: 28.00, is_assumed: false },
  { name: 'Angelpark Hanstedt', type: 'teich', latitude: 53.2678, longitude: 9.8567, region: 'Niedersachsen', fish_species: ['Forelle', 'Karpfen', 'Stör'], requires_permit: true, permit_price: 22.00, is_assumed: false },
  { name: 'Brunausee Buchholz', type: 'see', latitude: 53.3234, longitude: 9.8678, region: 'Niedersachsen', fish_species: ['Hecht', 'Zander', 'Barsch', 'Aal'], requires_permit: true, permit_price: 18.00, is_assumed: false },
  { name: 'Elbdeich-Teiche Winsen', type: 'teich', latitude: 53.3567, longitude: 10.2123, region: 'Niedersachsen', fish_species: ['Karpfen', 'Schleie', 'Brassen'], requires_permit: true, permit_price: 14.00, is_assumed: false },
  { name: 'Forellenteich Buxtehude', type: 'teich', latitude: 53.4678, longitude: 9.6789, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling'], requires_permit: true, permit_price: 24.00, is_assumed: false },
  { name: 'Este bei Buxtehude', type: 'fluss', latitude: 53.4789, longitude: 9.7012, region: 'Niedersachsen', fish_species: ['Forelle', 'Döbel', 'Barsch'], requires_permit: true, permit_price: 10.00, is_assumed: false },
  { name: 'Angelteich Horneburg', type: 'teich', latitude: 53.5123, longitude: 9.5789, region: 'Niedersachsen', fish_species: ['Karpfen', 'Forelle', 'Wels'], requires_permit: true, permit_price: 20.00, is_assumed: false },
  { name: 'Neuländer See', type: 'see', latitude: 53.4456, longitude: 10.0234, region: 'Hamburg', fish_species: ['Hecht', 'Zander', 'Karpfen', 'Aal'], requires_permit: true, permit_price: 22.00, is_assumed: false },
  { name: 'Eichbaumsee', type: 'see', latitude: 53.4923, longitude: 10.1567, region: 'Hamburg', fish_species: ['Karpfen', 'Hecht', 'Schleie'], requires_permit: true, permit_price: 16.00, is_assumed: false },
  { name: 'Hohendeicher See', type: 'see', latitude: 53.4634, longitude: 10.1789, region: 'Hamburg', fish_species: ['Hecht', 'Zander', 'Barsch'], requires_permit: true, permit_price: 20.00, is_assumed: false },
  
  // Assumed/Vorgeschlagene Teiche (näher an Bendestorf)
  { name: 'Angelteich Jesteburg', type: 'teich', latitude: 53.3012, longitude: 9.9456, region: 'Niedersachsen', fish_species: ['Forelle', 'Karpfen'], requires_permit: true, permit_price: 18.00, is_assumed: true },
  { name: 'Forellenteich Tostedt', type: 'teich', latitude: 53.2789, longitude: 9.7123, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling'], requires_permit: true, permit_price: 22.00, is_assumed: true },
  { name: 'Karpfenteich Nenndorf', type: 'teich', latitude: 53.3234, longitude: 9.8012, region: 'Niedersachsen', fish_species: ['Karpfen', 'Schleie'], requires_permit: true, permit_price: 15.00, is_assumed: true },
  { name: 'Waldteich Holm-Seppensen', type: 'teich', latitude: 53.3456, longitude: 9.8345, region: 'Niedersachsen', fish_species: ['Forelle', 'Barsch'], requires_permit: true, permit_price: 16.00, is_assumed: true },
  { name: 'Angelparadies Kakenstorf', type: 'teich', latitude: 53.2567, longitude: 9.7567, region: 'Niedersachsen', fish_species: ['Karpfen', 'Forelle', 'Stör'], requires_permit: true, permit_price: 25.00, is_assumed: true },
  { name: 'Mühlenteich Marxen', type: 'teich', latitude: 53.3678, longitude: 10.0567, region: 'Niedersachsen', fish_species: ['Forelle', 'Karpfen'], requires_permit: true, permit_price: 17.00, is_assumed: true },
  { name: 'Heide-Angelteich Undeloh', type: 'teich', latitude: 53.2123, longitude: 9.9234, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling'], requires_permit: true, permit_price: 20.00, is_assumed: true },
  { name: 'Privatteich Welle', type: 'teich', latitude: 53.2890, longitude: 9.6890, region: 'Niedersachsen', fish_species: ['Karpfen', 'Schleie', 'Brassen'], requires_permit: true, permit_price: 14.00, is_assumed: true },
  { name: 'Forstteich Sprötze', type: 'teich', latitude: 53.3567, longitude: 9.7890, region: 'Niedersachsen', fish_species: ['Forelle', 'Barsch'], requires_permit: true, permit_price: 19.00, is_assumed: true },
  { name: 'Naturteich Ashausen', type: 'teich', latitude: 53.3890, longitude: 10.0890, region: 'Niedersachsen', fish_species: ['Karpfen', 'Hecht', 'Schleie'], requires_permit: true, permit_price: 16.00, is_assumed: true },
  // Ganz nah an Bendestorf
  { name: 'Teich am Kleckerwald', type: 'teich', latitude: 53.3380, longitude: 9.9650, region: 'Niedersachsen', fish_species: ['Forelle', 'Karpfen'], requires_permit: true, permit_price: 15.00, is_assumed: true },
  { name: 'Forellenteich Bendestorf', type: 'teich', latitude: 53.3320, longitude: 9.9800, region: 'Niedersachsen', fish_species: ['Forelle', 'Saibling'], requires_permit: true, permit_price: 20.00, is_assumed: true },
  { name: 'Angelteich Ehestorf', type: 'teich', latitude: 53.3890, longitude: 9.9234, region: 'Niedersachsen', fish_species: ['Karpfen', 'Schleie'], requires_permit: true, permit_price: 16.00, is_assumed: true },
];

async function seedDatabase() {
  console.log('🎣 BISS Database Seeding...\n');

  let success = 0;
  let failed = 0;

  for (const wb of waterBodies) {
    const { error } = await supabase
      .from('water_bodies')
      .insert(wb);

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log(`⏭️  ${wb.name} (bereits vorhanden)`);
      } else {
        console.log(`❌ ${wb.name}: ${error.message}`);
        failed++;
      }
    } else {
      console.log(`✅ ${wb.name} (${wb.type})`);
      success++;
    }
  }

  // Count total
  const { count } = await supabase
    .from('water_bodies')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎉 Done! Neu hinzugefügt: ${success}, Fehler: ${failed}`);
  console.log(`📊 Total Gewässer in DB: ${count}`);
}

seedDatabase().catch(console.error);
