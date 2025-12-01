/**
 * Google Places Service - Invisible data provider
 * 
 * Fetches photos, ratings, and hours from Google Places
 * WITHOUT showing any Google branding - all displayed in our custom UI
 * 
 * Free Tier Safe: ~1000 requests/day on free tier
 */

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || '';

export interface PlaceData {
  photo?: string;
  photos?: string[];  // 🆕 Alle Fotos (bis zu 10)
  rating?: number;
  openNow?: boolean;
  hours?: string[];
  reviewCount?: number;
  // 🆕 Above and Beyond Fields
  reviews?: PlaceReview[];
  website?: string;
  phone?: string;
  address?: string;
  googleMapsUrl?: string;
  priceLevel?: 0 | 1 | 2 | 3 | 4; // Free, Inexpensive, Moderate, Expensive, Very Expensive
  editorialSummary?: string;
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  // Angler-relevant fields (Atmosphere tier)
  allowsDogs?: boolean;
  hasRestroom?: boolean;
}

export interface PlaceReview {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime: string; // "vor 2 Wochen"
  time: number; // Unix timestamp
}

/**
 * 🆕 ABOVE AND BEYOND: Extended fields for rich data
 * All available fields in one request for maximum value
 */
const PLACE_DETAILS_FIELDS = [
  // Basic (free tier)
  'place_id',
  'name',
  'geometry',
  'formatted_address',
  'business_status',
  // Contact 
  'formatted_phone_number',
  'website',
  'url', // Google Maps link
  'opening_hours',
  // Atmosphere (extra cost but high value)
  'photos',
  'rating',
  'user_ratings_total',
  'price_level',
  'reviews',
  'editorial_summary',
].join(',');

/**
 * Fetch place details by coordinates and name
 * 🆕 Enhanced with ALL available fields
 */
export const fetchPlaceDetails = async (
  lat: number,
  lng: number,
  name: string,
  options: { includeReviews?: boolean; maxPhotos?: number } = {}
): Promise<PlaceData> => {
  const { includeReviews = true, maxPhotos = 5 } = options;
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.log('Google Places API key not configured - using fallback');
    return {};
  }

  try {
    // Step 1: Find place by coordinates and name (Nearby Search)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${encodeURIComponent(name)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results?.length) {
      // Try text search as fallback
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(name + ' fishing')}&location=${lat},${lng}&radius=2000&key=${GOOGLE_PLACES_API_KEY}`;
      const textResponse = await fetch(textSearchUrl);
      const textData = await textResponse.json();
      
      if (textData.status !== 'OK' || !textData.results?.length) {
        return {};
      }
      searchData.results = textData.results;
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // Step 2: Get ALL details with extended fields
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${PLACE_DETAILS_FIELDS}&language=de&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    const details = detailsData.result || {};

    // Step 3: Build photo URLs (up to maxPhotos)
    const photos: string[] = [];
    if (details.photos?.length > 0) {
      for (let i = 0; i < Math.min(details.photos.length, maxPhotos); i++) {
        const photoRef = details.photos[i].photo_reference;
        photos.push(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`
        );
      }
    }

    // Step 4: Transform reviews
    const reviews: PlaceReview[] = [];
    if (includeReviews && details.reviews?.length > 0) {
      for (const review of details.reviews.slice(0, 5)) {
        reviews.push({
          authorName: review.author_name,
          authorPhoto: review.profile_photo_url,
          rating: review.rating,
          text: review.text,
          relativeTime: review.relative_time_description,
          time: review.time,
        });
      }
    }

    // Step 5: Build complete PlaceData
    return {
      // Photos
      photo: photos[0],
      photos,
      // Ratings
      rating: details.rating,
      reviewCount: details.user_ratings_total,
      reviews,
      // Hours
      openNow: details.opening_hours?.open_now,
      hours: details.opening_hours?.weekday_text,
      // Contact
      phone: details.formatted_phone_number,
      website: details.website,
      address: details.formatted_address,
      // Links
      googleMapsUrl: details.url,
      // Status & Price
      businessStatus: details.business_status,
      priceLevel: details.price_level,
      // Editorial
      editorialSummary: details.editorial_summary?.overview,
    };
  } catch (error) {
    console.error('Google Places fetch error:', error);
    return {};
  }
};

/**
 * 🆕 Fetch extended atmosphere data (extra API cost)
 * Call separately for premium users only
 */
export const fetchPlaceAtmosphere = async (
  placeId: string
): Promise<{ allowsDogs?: boolean; hasRestroom?: boolean }> => {
  if (!GOOGLE_PLACES_API_KEY) return {};
  
  try {
    // Note: These fields require Atmosphere tier pricing
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=allows_dogs,restroom&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      allowsDogs: data.result?.allows_dogs,
      hasRestroom: data.result?.restroom,
    };
  } catch (error) {
    return {};
  }
};

/**
 * Get static map image URL (for offline/preview)
 */
export const getStaticMapUrl = (
  lat: number,
  lng: number,
  zoom: number = 15,
  width: number = 400,
  height: number = 200
): string => {
  if (!GOOGLE_PLACES_API_KEY) {
    return '';
  }
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Check if Google Places is configured
 */
export const isGooglePlacesConfigured = (): boolean => {
  return !!GOOGLE_PLACES_API_KEY;
};
