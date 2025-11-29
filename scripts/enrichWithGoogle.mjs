/**
 * BISS Google Places Enrichment
 * Adds photos, ratings, and better coordinates from Google Places
 * Run with: node scripts/enrichWithGoogle.mjs
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!GOOGLE_API_KEY) {
  console.log('⚠️  No Google API key - will search without enrichment');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Search Google Places for fishing spots
async function searchGooglePlaces(query, lat, lon) {
  if (!GOOGLE_API_KEY) return null;
  
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: query,
          inputtype: 'textquery',
          locationbias: `circle:5000@${lat},${lon}`,
          fields: 'place_id,name,geometry,rating,user_ratings_total,photos,formatted_address,opening_hours,website',
          key: GOOGLE_API_KEY,
          language: 'de',
        },
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0];
    }
  } catch (error) {
    console.error('Google API error:', error.message);
  }
  return null;
}

// Get photo URL from Google Places
function getPhotoUrl(photoReference) {
  if (!photoReference || !GOOGLE_API_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  BISS Google Places Enrichment');
  console.log('═══════════════════════════════════════════════════\n');

  // Fetch all water bodies from Supabase
  const { data: waterBodies, error } = await supabase
    .from('water_bodies')
    .select('*')
    .is('place_id', null) // Only ones not yet enriched
    .limit(50); // Process in batches

  if (error) {
    console.error('❌ Supabase error:', error.message);
    return;
  }

  console.log(`📄 Found ${waterBodies.length} water bodies to enrich\n`);

  let enriched = 0;
  let notFound = 0;

  for (const wb of waterBodies) {
    console.log(`🔍 Searching: ${wb.name}...`);
    
    // Search Google for this water body
    const googleData = await searchGooglePlaces(
      wb.name,
      wb.latitude,
      wb.longitude
    );

    if (googleData) {
      // Get photo URL if available
      let photoUrl = null;
      if (googleData.photos && googleData.photos.length > 0) {
        photoUrl = getPhotoUrl(googleData.photos[0].photo_reference);
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('water_bodies')
        .update({
          place_id: googleData.place_id,
          place_photo: photoUrl,
          place_rating: googleData.rating,
          // Use Google's coordinates (often more accurate)
          latitude: googleData.geometry?.location?.lat?.toString() || wb.latitude,
          longitude: googleData.geometry?.location?.lng?.toString() || wb.longitude,
        })
        .eq('id', wb.id);

      if (!updateError) {
        console.log(`   ✅ Found! Rating: ${googleData.rating || 'N/A'}, Photo: ${photoUrl ? 'Yes' : 'No'}`);
        enriched++;
      } else {
        console.log(`   ❌ Update failed: ${updateError.message}`);
      }
    } else {
      console.log(`   ⚠️  Not found on Google`);
      notFound++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ENRICHMENT COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✅ Enriched: ${enriched}`);
  console.log(`  ⚠️  Not found: ${notFound}`);
  console.log(`  📊 Total processed: ${waterBodies.length}`);
}

main();
