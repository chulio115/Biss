/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BISS DATA ACQUISITION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * "Above and Beyond" Data Strategy:
 * Kombiniert MEHRERE kostenlose Datenquellen zu einem reichhaltigen Datensatz
 * 
 * Quellen:
 * 1. OpenStreetMap (Overpass API) - Gewässer-Geometrien & Basis-Infos
 * 2. Google Places API - Fotos, Ratings, Öffnungszeiten
 * 3. Wikidata - Zusätzliche Metadaten (Fläche, Tiefe)
 * 4. Manuelle Kuration - Fischarten, Erlaubnisse
 */

import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RawWaterBody {
  id: string;
  name: string;
  type: 'lake' | 'pond' | 'river' | 'reservoir' | 'canal' | 'stream';
  latitude: number;
  longitude: number;
  osmId?: number;
  tags?: Record<string, string>;
}

export interface EnrichedWaterBody extends RawWaterBody {
  // Basis
  region: string;
  address?: string;
  
  // Angeln-spezifisch
  fish_species: string[];
  permit_required: boolean;
  permit_price: number | null;
  permit_contact?: string;
  permit_url?: string;
  
  // Google Places
  placeId?: string;
  placePhoto?: string;
  placeRating?: number;
  placeTotalRatings?: number;
  placeOpenNow?: boolean;
  placeHours?: string[];
  placeWebsite?: string;
  placePhone?: string;
  geometry?: { location: { lat: number; lng: number } }; // 🆕 Precise coordinates
  
  // Wikidata
  wikidataId?: string;
  surfaceArea?: number; // km²
  maxDepth?: number; // meters
  elevation?: number; // meters
  
  // Meta
  dataSource: 'osm' | 'google' | 'manual' | 'combined';
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low';
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERPASS API - OpenStreetMap Gewässer
// ─────────────────────────────────────────────────────────────────────────────

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Norddeutschland Bounding Box (NDS + HH + SH)
const NORDDEUTSCHLAND_BBOX = {
  south: 51.29,
  north: 54.91,  // Erweitert bis Flensburg/dänische Grenze
  west: 6.65,
  east: 11.56,
};

// Legacy alias
const NIEDERSACHSEN_BBOX = NORDDEUTSCHLAND_BBOX;

// Regional Bounding Boxes für gezielte Queries
export const REGION_BOXES = {
  niedersachsen: { south: 51.29, north: 53.89, west: 6.65, east: 11.56 },
  hamburg: { south: 53.39, north: 53.74, west: 9.72, east: 10.33 },
  schleswig_holstein: { south: 53.36, north: 54.91, west: 8.30, east: 11.31 },
};

/**
 * Queries OpenStreetMap for water bodies in a region
 * Returns lakes, ponds, reservoirs, rivers, canals with fishing potential
 */
export const fetchOSMWaterBodies = async (
  bbox: typeof NIEDERSACHSEN_BBOX = NORDDEUTSCHLAND_BBOX,
  limit: number = 1000
): Promise<RawWaterBody[]> => {
  // Overpass QL Query für ALLE Angelgewässer (inkl. Flüsse)
  const query = `
    [out:json][timeout:90];
    (
      // Seen
      way["natural"="water"]["water"="lake"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      relation["natural"="water"]["water"="lake"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Teiche
      way["natural"="water"]["water"="pond"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Stauseen
      way["natural"="water"]["water"="reservoir"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Flüsse (NEU! - Hauptgewässer für 60%+ der Angler)
      way["waterway"="river"]["name"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      relation["waterway"="river"]["name"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Kanäle
      way["waterway"="canal"]["name"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Explizite Angelgewässer
      way["leisure"="fishing"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["leisure"="fishing"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Sport Fishing
      way["sport"="fishing"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["sport"="fishing"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out center body;
    >;
    out skel qt;
  `;

  try {
    console.log('📍 Fetching water bodies from OpenStreetMap...');
    
    const response = await axios.post(
      OVERPASS_API_URL,
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 60000,
      }
    );

    const elements = response.data.elements || [];
    
    // Transform OSM data to our format
    const waterBodies: RawWaterBody[] = elements
      .filter((el: any) => el.tags?.name && (el.center || (el.lat && el.lon)))
      .map((el: any) => {
        const lat = el.center?.lat || el.lat;
        const lon = el.center?.lon || el.lon;
        
        return {
          id: `osm-${el.type}-${el.id}`,
          name: el.tags.name,
          type: mapOSMWaterType(el.tags),
          latitude: lat,
          longitude: lon,
          osmId: el.id,
          tags: el.tags,
        };
      })
      .slice(0, limit);

    // Log breakdown by type
    const rivers = waterBodies.filter(wb => wb.type === 'river').length;
    const canals = waterBodies.filter(wb => wb.type === 'canal').length;
    const lakes = waterBodies.filter(wb => wb.type === 'lake').length;
    const ponds = waterBodies.filter(wb => wb.type === 'pond').length;
    console.log(`✅ Found ${waterBodies.length} water bodies from OSM`);
    console.log(`   🏞️ ${lakes} Seen, 🐟 ${ponds} Teiche, 🌊 ${rivers} Flüsse, 🚢 ${canals} Kanäle`);
    return waterBodies;
    
  } catch (error: any) {
    console.error('❌ OSM fetch error:', error.message);
    throw error;
  }
};

/**
 * Maps OSM tags to our water type
 */
const mapOSMWaterType = (tags: Record<string, string>): RawWaterBody['type'] => {
  if (tags.water === 'lake') return 'lake';
  if (tags.water === 'pond') return 'pond';
  if (tags.water === 'reservoir') return 'reservoir';
  if (tags.water === 'river' || tags.waterway === 'river') return 'river';
  if (tags.water === 'canal' || tags.waterway === 'canal') return 'canal';
  if (tags.water === 'stream' || tags.waterway === 'stream') return 'stream';
  if (tags.leisure === 'fishing' || tags.sport === 'fishing') return 'pond'; // Assume pond
  return 'lake'; // Default
};

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE PLACES API - Enrichment
// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || '';

/**
 * Searches Google Places for fishing spots near coordinates
 */
export const searchGooglePlacesFishing = async (
  lat: number,
  lon: number,
  radius: number = 10000 // 10km
): Promise<any[]> => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️ Google Places API key not configured');
    return [];
  }

  const searchTerms = [
    'Angelteich',
    'Forellenteich',
    'Fischzucht',
    'Angelsee',
  ];

  const results: any[] = [];

  for (const term of searchTerms) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lon}`,
            radius,
            keyword: term,
            key: GOOGLE_PLACES_API_KEY,
            language: 'de',
          },
        }
      );

      if (response.data.results) {
        results.push(...response.data.results);
      }
    } catch (error) {
      console.error(`Google Places search error for "${term}":`, error);
    }
  }

  // Deduplicate by place_id
  const uniqueResults = results.filter(
    (r, i, arr) => arr.findIndex(x => x.place_id === r.place_id) === i
  );

  return uniqueResults;
};

/**
 * Enriches a water body with Google Places data
 */
export const enrichWithGooglePlaces = async (
  waterBody: RawWaterBody
): Promise<Partial<EnrichedWaterBody>> => {
  if (!GOOGLE_PLACES_API_KEY) return {};

  try {
    // Search for the place by name + location
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: waterBody.name,
          inputtype: 'textquery',
          locationbias: `circle:5000@${waterBody.latitude},${waterBody.longitude}`,
          fields: 'place_id,name,rating,user_ratings_total,photos,opening_hours,website,formatted_phone_number,formatted_address,geometry',
          key: GOOGLE_PLACES_API_KEY,
          language: 'de',
        },
      }
    );

    if (response.data.candidates && response.data.candidates.length > 0) {
      const place = response.data.candidates[0];
      
      // Get photo URL if available
      let photoUrl: string | undefined;
      if (place.photos && place.photos.length > 0) {
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
      }

      return {
        placeId: place.place_id,
        placePhoto: photoUrl,
        placeRating: place.rating,
        placeTotalRatings: place.user_ratings_total,
        placeOpenNow: place.opening_hours?.open_now,
        placeWebsite: place.website,
        placePhone: place.formatted_phone_number,
        address: place.formatted_address,
        geometry: place.geometry, // 🆕 Include precise coordinates
      };
    }
  } catch (error) {
    console.error('Google Places enrichment error:', error);
  }

  return {};
};

// ─────────────────────────────────────────────────────────────────────────────
// WIKIDATA API - Additional Metadata
// ─────────────────────────────────────────────────────────────────────────────

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

/**
 * Queries Wikidata for lake information
 */
export const fetchWikidataLakeInfo = async (
  lakeName: string
): Promise<{
  wikidataId?: string;
  surfaceArea?: number;
  maxDepth?: number;
  elevation?: number;
} | null> => {
  const query = `
    SELECT ?lake ?lakeLabel ?area ?depth ?elevation WHERE {
      ?lake wdt:P31 wd:Q23397 .  # Instance of lake
      ?lake rdfs:label "${lakeName}"@de .
      OPTIONAL { ?lake wdt:P2046 ?area . }
      OPTIONAL { ?lake wdt:P4511 ?depth . }
      OPTIONAL { ?lake wdt:P2044 ?elevation . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
    }
    LIMIT 1
  `;

  try {
    const response = await axios.get(WIKIDATA_SPARQL_URL, {
      params: { query, format: 'json' },
      headers: { Accept: 'application/sparql-results+json' },
    });

    const results = response.data.results?.bindings;
    if (results && results.length > 0) {
      const result = results[0];
      return {
        wikidataId: result.lake?.value?.split('/').pop(),
        surfaceArea: result.area?.value ? parseFloat(result.area.value) : undefined,
        maxDepth: result.depth?.value ? parseFloat(result.depth.value) : undefined,
        elevation: result.elevation?.value ? parseFloat(result.elevation.value) : undefined,
      };
    }
  } catch (error) {
    // Wikidata may not have data for all lakes
    console.log(`No Wikidata found for: ${lakeName}`);
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FISH SPECIES DATABASE - Curated Data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common fish species by water type in Germany
 * Used as fallback when specific data isn't available
 */
export const FISH_BY_WATER_TYPE: Record<RawWaterBody['type'], string[]> = {
  lake: ['Hecht', 'Zander', 'Barsch', 'Karpfen', 'Schleie', 'Brassen', 'Rotauge'],
  pond: ['Forelle', 'Karpfen', 'Schleie', 'Barsch'],
  reservoir: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Karpfen'],
  river: ['Hecht', 'Zander', 'Barsch', 'Aal', 'Döbel', 'Barbe'],
  canal: ['Hecht', 'Zander', 'Karpfen', 'Brassen', 'Aal'],
  stream: ['Forelle', 'Äsche', 'Döbel', 'Barbe'],
};

/**
 * Estimates likely fish species based on water type and region
 */
export const estimateFishSpecies = (
  waterBody: RawWaterBody,
  region: string
): string[] => {
  const baseFish = FISH_BY_WATER_TYPE[waterBody.type] || [];
  
  // Regional adjustments (Niedersachsen specifics)
  if (region.toLowerCase().includes('harz')) {
    return ['Forelle', 'Äsche', 'Barsch', ...baseFish.slice(0, 3)];
  }
  if (region.toLowerCase().includes('heide')) {
    return ['Hecht', 'Aal', 'Karpfen', ...baseFish.slice(0, 3)];
  }
  
  return baseFish.slice(0, 5); // Limit to 5 most likely
};

// ─────────────────────────────────────────────────────────────────────────────
// REGION DETECTION - Reverse Geocoding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines the region/Landkreis from coordinates
 * Uses OpenStreetMap Nominatim (free)
 */
export const detectRegion = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'BISS-App/1.0 (fishing spot finder)',
        },
      }
    );

    const address = response.data.address;
    // Prioritize: city > county > state
    return address.city || address.town || address.county || address.state || 'Niedersachsen';
  } catch (error) {
    return 'Niedersachsen';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: Combined Data Acquisition
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master function: Fetches and enriches water body data from all sources
 */
export const acquireWaterBodyData = async (options: {
  bbox?: typeof NIEDERSACHSEN_BBOX;
  limit?: number;
  enrichWithGoogle?: boolean;
  enrichWithWikidata?: boolean;
}): Promise<EnrichedWaterBody[]> => {
  const {
    bbox = NIEDERSACHSEN_BBOX,
    limit = 100,
    enrichWithGoogle = true,
    enrichWithWikidata = false, // Slow, use selectively
  } = options;

  console.log('🚀 Starting data acquisition...');
  console.log(`   Region: ${bbox.south}-${bbox.north}, ${bbox.west}-${bbox.east}`);
  console.log(`   Limit: ${limit}`);

  // Step 1: Get base data from OSM
  const rawData = await fetchOSMWaterBodies(bbox, limit);
  console.log(`📍 OSM returned ${rawData.length} water bodies`);

  // Step 2: Enrich each water body
  const enrichedData: EnrichedWaterBody[] = [];

  for (const raw of rawData) {
    // Detect region
    const region = await detectRegion(raw.latitude, raw.longitude);
    
    // Estimate fish species
    const fish_species = estimateFishSpecies(raw, region);
    
    // Build enriched object
    const enriched: EnrichedWaterBody = {
      ...raw,
      region,
      fish_species,
      permit_required: true, // Assume permit needed (safe default)
      permit_price: null,
      dataSource: 'osm',
      lastUpdated: new Date().toISOString(),
      confidence: 'medium',
    };

    // Google Places enrichment (optional)
    if (enrichWithGoogle) {
      const googleData = await enrichWithGooglePlaces(raw);
      Object.assign(enriched, googleData);
      if (googleData.placeId) {
        enriched.dataSource = 'combined';
        enriched.confidence = 'high';
      }
    }

    // Wikidata enrichment (optional, slow)
    if (enrichWithWikidata && raw.type === 'lake') {
      const wikiData = await fetchWikidataLakeInfo(raw.name);
      if (wikiData) {
        Object.assign(enriched, wikiData);
      }
    }

    enrichedData.push(enriched);
    
    // Rate limiting (be nice to APIs)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Enriched ${enrichedData.length} water bodies`);
  return enrichedData;
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT: Ready-to-use for Supabase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts enriched data to Supabase-compatible format
 */
export const toSupabaseFormat = (data: EnrichedWaterBody[]) => {
  return data.map(wb => ({
    id: wb.id,
    name: wb.name,
    type: wb.type,
    latitude: wb.latitude,
    longitude: wb.longitude,
    region: wb.region,
    fish_species: wb.fish_species,
    permit_price: wb.permit_price,
    permit_required: wb.permit_required,
    is_assumed: wb.confidence !== 'high',
    place_photo: wb.placePhoto,
    place_rating: wb.placeRating,
    data_source: wb.dataSource,
    updated_at: wb.lastUpdated,
  }));
};

export default {
  fetchOSMWaterBodies,
  searchGooglePlacesFishing,
  enrichWithGooglePlaces,
  fetchWikidataLakeInfo,
  detectRegion,
  acquireWaterBodyData,
  toSupabaseFormat,
  NIEDERSACHSEN_BBOX,
  FISH_BY_WATER_TYPE,
};
