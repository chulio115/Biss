/**
 * BISS Water Body Data Fetcher
 * Fetches water bodies from OpenStreetMap for Niedersachsen
 * Run with: node scripts/fetchWaterBodies.mjs
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BBOX: {
    south: 52.5,
    north: 53.8,
    west: 9.0,
    east: 11.0,
  },
  OUTPUT_FILE: path.join(__dirname, '../data/niedersachsen-water-bodies.json'),
  LIMIT: 200,
};

const FISH_BY_TYPE = {
  lake: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Schleie', 'Brassen'],
  pond: ['Forelle', 'Karpfen', 'Schleie', 'Barsch'],
  reservoir: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen'],
  river: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Döbel'],
  canal: ['Hecht', 'Zander', 'Karpfen', 'Brassen', 'Aal'],
  stream: ['Forelle', 'Äsche', 'Döbel'],
};

async function fetchFromOSM() {
  const { south, north, west, east } = CONFIG.BBOX;
  
  const query = `
    [out:json][timeout:120];
    (
      way["natural"="water"]["water"="lake"]["name"](${south},${west},${north},${east});
      relation["natural"="water"]["water"="lake"]["name"](${south},${west},${north},${east});
      way["natural"="water"]["water"="pond"]["name"](${south},${west},${north},${east});
      way["natural"="water"]["water"="reservoir"]["name"](${south},${west},${north},${east});
      way["leisure"="fishing"]["name"](${south},${west},${north},${east});
      node["leisure"="fishing"]["name"](${south},${west},${north},${east});
      way["landuse"="aquaculture"]["name"](${south},${west},${north},${east});
    );
    out center body;
    >;
    out skel qt;
  `;

  console.log('🌍 Fetching from OpenStreetMap...');

  const response = await axios.post(
    'https://overpass-api.de/api/interpreter',
    `data=${encodeURIComponent(query)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 120000,
    }
  );

  return response.data.elements || [];
}

function mapWaterType(tags) {
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

function transformOSMData(elements) {
  const waterBodies = [];

  for (const el of elements) {
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
      latitude: lat.toString(),
      longitude: lon.toString(),
      region: 'Niedersachsen',
      fish_species: fish.slice(0, 4),
      permit_price: null,
      permit_required: true,
      is_assumed: true,
    });
  }

  return waterBodies;
}

function deduplicateAndFilter(waterBodies) {
  const seen = new Set();
  const unique = [];

  for (const wb of waterBodies) {
    const normalizedName = wb.name.toLowerCase().replace(/\s+/g, '');
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      unique.push(wb);
    }
  }

  unique.sort((a, b) => a.name.localeCompare(b.name));
  return unique.slice(0, CONFIG.LIMIT);
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  BISS Water Body Data Fetcher');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    const rawElements = await fetchFromOSM();
    console.log(`✅ Received ${rawElements.length} elements from OSM`);

    const waterBodies = transformOSMData(rawElements);
    console.log(`✅ Transformed to ${waterBodies.length} water bodies`);

    const unique = deduplicateAndFilter(waterBodies);
    console.log(`✅ After deduplication: ${unique.length} unique water bodies`);

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
        source: 'OpenStreetMap',
      },
      waterBodies: unique,
    };

    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`✅ Saved to ${CONFIG.OUTPUT_FILE}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    
    const byType = {};
    for (const wb of unique) {
      byType[wb.type] = (byType[wb.type] || 0) + 1;
    }
    
    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('\nSample water bodies:');
    unique.slice(0, 15).forEach((wb, i) => {
      console.log(`  ${i + 1}. ${wb.name} (${wb.type}) - ${wb.fish_species.join(', ')}`);
    });

    console.log('\n✅ Data acquisition complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
