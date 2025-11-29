// Create Admin User
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ufligmprfiqteshotxhf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbGlnbXByZmlxdGVzaG90eGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMxNDgsImV4cCI6MjA3OTk4OTE0OH0.8yT21LVg05KNO_eREQuoeI6Jb4NOQ-ozywUuSgw-E08';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('Creating admin user...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'bissapp.admin@gmail.com',
    password: 'Kennwort123',
    options: {
      data: {
        full_name: 'Admin',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Admin user created!');
    console.log('   Email: admin@biss-app.de');
    console.log('   Password: Kennwort123');
  }
}

createAdmin();
