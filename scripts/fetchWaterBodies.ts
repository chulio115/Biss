/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS Data Fetcher Script
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Fetches water bodies from OpenStreetMap for Niedersachsen
 * Run with: npx ts-node scripts/fetchWaterBodies.ts
 * 
 * This script will:
 * 1. Query OSM for all water bodies in Niedersachsen
 * 2. Enrich with Google Places data (if API key available)
 * 3. Output JSON ready for Supabase import
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  // Region: Niedersachsen + Hamburg Area (around Lüneburg)
  BBOX: {
    south: 52.5, // Slightly north of Hannover
    north: 53.8, // Up to Hamburg
    west: 9.0,   // West of Lüneburg
    east: 11.0,  // East towards Uelzen
  },
  OUTPUT_FILE: path.join(__dirname, '../data/niedersachsen-water-bodies.json'),
  LIMIT: 200,
};

// Fish species by water type
const FISH_BY_TYPE: Record<string, string[]> = {
  lake: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Schleie', 'Brassen'],
  pond: ['Forelle', 'Karpfen', 'Schleie', 'Barsch'],
  reservoir: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen'],
  river: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Döbel'],
  canal: ['Hecht', 'Zander', 'Karpfen', 'Brassen', 'Aal'],
  stream: ['Forelle', 'Äsche', 'Döbel'],
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERPASS API QUERY
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFromOSM() {
  const { south, north, west, east } = CONFIG.BBOX;
  
  // Overpass QL Query
  const query = `
    [out:json][timeout:120];
    (
      // Named lakes
      way["natural"="water"]["water"="lake"]["name"](${south},${west},${north},${east});
      relation["natural"="water"]["water"="lake"]["name"](${south},${west},${north},${east});
      
      // Named ponds
      way["natural"="water"]["water"="pond"]["name"](${south},${west},${north},${east});
      
      // Named reservoirs
      way["natural"="water"]["water"="reservoir"]["name"](${south},${west},${north},${east});
      
      // Fishing spots (explicit)
      way["leisure"="fishing"]["name"](${south},${west},${north},${east});
      node["leisure"="fishing"]["name"](${south},${west},${north},${east});
      
      // Fish ponds (Fischteich)
      way["landuse"="aquaculture"]["name"](${south},${west},${north},${east});
    );
    out center body;
    >;
    out skel qt;
  `;

  console.log('🌍 Fetching from OpenStreetMap Overpass API...');
  console.log(`   Bounding box: ${south},${west} to ${north},${east}`);

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 120000,
      }
    );

    return response.data.elements || [];
  } catch (error: any) {
    console.error('❌ OSM Error:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA TRANSFORMATION
// ─────────────────────────────────────────────────────────────────────────────

function mapWaterType(tags: Record<string, string>): string {
  if (tags.water === 'lake') return 'lake';
  if (tags.water === 'pond') return 'pond';
  if (tags.water === 'reservoir') return 'reservoir';
  if (tags.waterway === 'river' || tags.water === 'river') return 'river';
  if (tags.waterway === 'canal' || tags.water === 'canal') return 'canal';
  if (tags.waterway === 'stream') return 'stream';
  if (tags.leisure === 'fishing') return 'pond';
  if (tags.landuse === 'aquaculture') return 'pond';
  return 'lake';
}

function transformOSMData(elements: any[]) {
  const waterBodies: any[] = [];

  for (const el of elements) {
    // Skip elements without name or coordinates
    if (!el.tags?.name) continue;
    
    const lat = el.center?.lat || el.lat;
    const lon = el.center?.lon || el.lon;
    if (!lat || !lon) continue;

    const type = mapWaterType(el.tags);
    const fish = FISH_BY_TYPE[type] || ['Hecht', 'Barsch'];

    waterBodies.push({
      id: `osm-${el.type}-${el.id}`,
      name: el.tags.name,
      type,
      latitude: lat,
      longitude: lon,
      region: 'Niedersachsen',
      fish_species: fish.slice(0, 4),
      permit_price: null,
      permit_required: true,
      is_assumed: true,
      osm_id: el.id,
      osm_type: el.type,
      tags: el.tags,
    });
  }

  return waterBodies;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION & FILTERING
// ─────────────────────────────────────────────────────────────────────────────

function deduplicateAndFilter(waterBodies: any[]) {
  // Remove duplicates by name similarity
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const wb of waterBodies) {
    const normalizedName = wb.name.toLowerCase().replace(/\s+/g, '');
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      unique.push(wb);
    }
  }

  // Sort by name
  unique.sort((a, b) => a.name.localeCompare(b.name));

  return unique.slice(0, CONFIG.LIMIT);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  BISS Water Body Data Fetcher');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Step 1: Fetch from OSM
    const rawElements = await fetchFromOSM();
    console.log(`✅ Received ${rawElements.length} elements from OSM`);

    // Step 2: Transform
    const waterBodies = transformOSMData(rawElements);
    console.log(`✅ Transformed to ${waterBodies.length} water bodies`);

    // Step 3: Deduplicate
    const unique = deduplicateAndFilter(waterBodies);
    console.log(`✅ After deduplication: ${unique.length} unique water bodies`);

    // Step 4: Save to file
    const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      metadata: {
        fetchedAt: new Date().toISOString(),
        region: 'Niedersachsen',
        bbox: CONFIG.BBOX,
        totalCount: unique.length,
        source: 'OpenStreetMap Overpass API',
      },
      waterBodies: unique,
    };

    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`✅ Saved to ${CONFIG.OUTPUT_FILE}`);

    // Step 5: Print summary
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    
    const byType: Record<string, number> = {};
    for (const wb of unique) {
      byType[wb.type] = (byType[wb.type] || 0) + 1;
    }
    
    console.log('By Type:');
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('');
    console.log('Sample water bodies:');
    unique.slice(0, 10).forEach((wb, i) => {
      console.log(`  ${i + 1}. ${wb.name} (${wb.type}) - ${wb.fish_species.join(', ')}`);
    });

    console.log('');
    console.log('✅ Data acquisition complete!');
    console.log(`   File: ${CONFIG.OUTPUT_FILE}`);
    console.log('   Next: Import to Supabase with: npm run import-data');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run
main();
