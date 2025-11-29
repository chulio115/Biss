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
  rating?: number;
  openNow?: boolean;
  hours?: string[];
  reviewCount?: number;
}

/**
 * Fetch place details by coordinates and name
 */
export const fetchPlaceDetails = async (
  lat: number,
  lng: number,
  name: string
): Promise<PlaceData> => {
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

    // Step 2: Get photo URL if available (800px wide)
    let photoUrl: string | undefined;
    if (place.photos?.length > 0) {
      const photoRef = place.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
    }

    // Step 3: Get detailed info (opening hours) if place_id exists
    let hours: string[] | undefined;
    if (place.place_id) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=opening_hours&key=${GOOGLE_PLACES_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.result?.opening_hours?.weekday_text) {
          hours = detailsData.result.opening_hours.weekday_text;
        }
      } catch (e) {
        console.log('Details fetch failed:', e);
      }
    }

    return {
      photo: photoUrl,
      rating: place.rating,
      openNow: place.opening_hours?.open_now,
      hours,
      reviewCount: place.user_ratings_total,
    };
  } catch (error) {
    console.error('Google Places fetch error:', error);
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
