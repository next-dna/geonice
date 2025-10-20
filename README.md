# geonice

A minimal, zero-dependency TypeScript geolocation toolkit for Node and Next.js:

- Geocoding & reverse-geocoding via OpenStreetMap Nominatim
- IP geolocation via ipapi.co
- ESM + CJS builds, strict types, Node 18+ native fetch
- Convenience: get latitude/longitude from city/state/country with a single call

Repository: https://github.com/next-dna/geonice

Node support: >=18

## Install

```bash
npm i geonice
```

Uses native `fetch` (Node 18+). For older Node versions, polyfill `fetch` globally.

## Usage

### CLI (npx)
```bash
# Get coordinates for any place worldwide
npx geonice "Washington, DC, USA"
# Output: {"lat":38.8950368,"lon":-77.0365427,"label":"Washington, District of Columbia, United States"}

npx geonice "Sydney, Australia"
npx geonice "Paris, France"
```

### Library
```ts
import { geocodeNominatim, reverseGeocodeNominatim, geocodePlace, lookupIp } from "geonice";

const results = await geocodeNominatim("Eiffel Tower", { userAgent: "your-app/1.0" });
const place = await reverseGeocodeNominatim(48.8584, 2.2945);
const ip = await lookupIp();

// Convenience: city/state/country in one string
const sydney = await geocodePlace("Sydney, Australia", { userAgent: "your-app/1.0" });

// Another example: Washington, DC (United States)
const dc = await geocodePlace("Washington, DC, USA", { userAgent: "your-app/1.0" });
console.log(dc?.lat, dc?.lon);
```

CommonJS:

```js
const { geocodeNominatim, reverseGeocodeNominatim, lookupIp } = require("geonice");

(async () => {
  const results = await geocodeNominatim("Eiffel Tower", { userAgent: "your-app/1.0" });
  const place = await reverseGeocodeNominatim(48.8584, 2.2945);
  const ip = await lookupIp();
  console.log(results[0], place, ip);
})();
```

## API

- `geocodePlace(query, opts?) => Promise<GeocodeResult | undefined>` — convenience for city/state/country strings
- `geocodeNominatim(query, opts?) => Promise<GeocodeResult[]>`
- `reverseGeocodeNominatim(lat, lon, opts?) => Promise<GeocodeResult>`
- `lookupIp(ip?, opts?) => Promise<IpLookupResult>`

Types exported: `Coordinates`, `GeocodeResult`, `GeocodeOptions`, `ReverseGeocodeOptions`, `IpLookupResult`.

## Respect provider usage policies

- Nominatim requires a valid `User-Agent` identifying your application.
- Be considerate with request frequency; add caching and backoff in production.
  - For Nominatim, include a descriptive `User-Agent` and follow their usage policy.
  - For ipapi.co, expect public endpoints to rate limit; consider paid tiers for production.

If your Node environment lacks a global `fetch` (Node <18), polyfill it:

```ts
// Option 1: Use undici
import { fetch } from "undici";
globalThis.fetch = fetch;

// Option 2: Use node-fetch
import fetch from "node-fetch";
globalThis.fetch = fetch;
```

## Contributing

Issues and PRs welcome at https://github.com/next-dna/geonice. Please run `npm run lint` and `npm run test` before submitting.

## License

MIT © 2025 Sandip Gami

## Author

- Name: Sandip Gami
- GitHub: https://github.com/next-dna
