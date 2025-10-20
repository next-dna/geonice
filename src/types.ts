export type Coordinates = { lat: number; lon: number };

export type GeocodeResult = Coordinates & {
  label: string;
  boundingBox?: { north: number; south: number; east: number; west: number };
};

export interface GeocodeOptions {
  signal?: AbortSignal;
  userAgent?: string; // sent to providers that require identification (e.g., Nominatim)
}

export interface ReverseGeocodeOptions extends GeocodeOptions {
  zoom?: number; // 0-18 for Nominatim
}

export interface IpLookupResult extends Coordinates {
  city?: string;
  region?: string;
  country?: string;
  postal?: string;
  timezone?: string;
  asn?: string;
  org?: string;
}
