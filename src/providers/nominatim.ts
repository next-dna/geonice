import type { GeocodeOptions, GeocodeResult, ReverseGeocodeOptions } from "../types";

const DEFAULT_BASE = "https://nominatim.openstreetmap.org";

function buildHeaders(userAgent?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (userAgent) headers["User-Agent"] = userAgent;
  return headers;
}

export async function geocodeNominatim(
  query: string,
  opts: GeocodeOptions = {},
): Promise<GeocodeResult[]> {
  const url = new URL("/search", DEFAULT_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");

  const res = await fetch(url, { headers: buildHeaders(opts.userAgent), signal: opts.signal });
  if (!res.ok) throw new Error(`Nominatim search failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as any[];
  return data.map((d) => ({
    lat: Number(d.lat),
    lon: Number(d.lon),
    label: d.display_name as string,
    boundingBox: d.boundingbox
      ? {
          north: Number(d.boundingbox[1]),
          south: Number(d.boundingbox[0]),
          east: Number(d.boundingbox[3]),
          west: Number(d.boundingbox[2]),
        }
      : undefined,
  }));
}

export async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
  opts: ReverseGeocodeOptions = {},
): Promise<GeocodeResult> {
  const url = new URL("/reverse", DEFAULT_BASE);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  if (typeof opts.zoom === "number") url.searchParams.set("zoom", String(opts.zoom));

  const res = await fetch(url, { headers: buildHeaders(opts.userAgent), signal: opts.signal });
  if (!res.ok) throw new Error(`Nominatim reverse failed: ${res.status} ${res.statusText}`);
  const d = (await res.json()) as any;
  return {
    lat: Number(d.lat),
    lon: Number(d.lon),
    label: d.display_name as string,
    boundingBox: d.boundingbox
      ? {
          north: Number(d.boundingbox[1]),
          south: Number(d.boundingbox[0]),
          east: Number(d.boundingbox[3]),
          west: Number(d.boundingbox[2]),
        }
      : undefined,
  };
}

// Convenience: returns the best match (first result) for a place string like city/state/country
export async function geocodePlace(
  query: string,
  opts: GeocodeOptions = {},
): Promise<GeocodeResult | undefined> {
  const results = await geocodeNominatim(query, opts);
  return results[0];
}
