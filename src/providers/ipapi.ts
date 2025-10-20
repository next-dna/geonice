import type { IpLookupResult } from "../types";

const DEFAULT_BASE = "https://ipapi.co";

export interface IpApiOptions {
  signal?: AbortSignal;
}

export async function lookupIp(ip?: string, opts: IpApiOptions = {}): Promise<IpLookupResult> {
  const path = ip ? `/${encodeURIComponent(ip)}/json/` : "/json/";
  const url = new URL(path, DEFAULT_BASE);
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) throw new Error(`ipapi request failed: ${res.status} ${res.statusText}`);
  const d = (await res.json()) as any;
  return {
    lat: Number(d.latitude),
    lon: Number(d.longitude),
    city: d.city,
    region: d.region,
    country: d.country_name ?? d.country,
    postal: d.postal,
    timezone: d.timezone,
    asn: d.asn,
    org: d.org,
  };
}
