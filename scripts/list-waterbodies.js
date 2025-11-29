// List all water bodies
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ufligmprfiqteshotxhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGlnbXByZmlxdGVzaG90eGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMxNDgsImV4cCI6MjA3OTk4OTE0OH0.8yT21LVg05KNO_eREQuoeI6Jb4NOQ-ozywUuSgw-E08';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listWaterbodies() {
  const { data, error } = await supabase
    .from('water_bodies')
    .select('id, name, type')
    .order('name');

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`Found ${data.length} water bodies:\n`);
  data.forEach(wb => {
    console.log(`- ${wb.name} (${wb.type})`);
  });
}

listWaterbodies();
