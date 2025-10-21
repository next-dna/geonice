# quick-geocode

A minimal, zero-dependency TypeScript geolocation toolkit for Node and Next.js:

- Geocoding & reverse-geocoding via OpenStreetMap Nominatim
- IP geolocation via ipapi.co
- ESM + CJS builds, strict types, Node 18+ native fetch
- Convenience: get latitude/longitude from city/state/country with a single call

Repository: https://github.com/next-dna/quick-geocode

Node support: >=18

## Comparison with alternatives

| Feature                   | **quick-geocode** _(yours)_                 | **node-geocoder**                           | **geolib**                                              | **node-open-geocoder**    |
| ------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | ------------------------- |
| 🧠 **Primary purpose**    | Geocoding, reverse geocoding, **IP lookup** | Geocoding/reverse via multiple providers    | Coordinate math (distance, bounds) — not true geocoding | Minimal Nominatim wrapper |
| 🌍 **Data sources**       | OpenStreetMap (Nominatim) + ipapi.co        | Google, Mapbox, OSM, OpenCage, etc.         | N/A (no geocoding API)                                  | OpenStreetMap only        |
| 🧩 **API keys required**  | ❌ No                                       | ✅ Usually (Google, Mapbox, etc.)           | ❌                                                      | ❌                        |
| ⚙️ **Dependencies**       | 🚫 Zero (uses native `fetch`)               | 6–10 dependencies                           | Several                                                 | 2 dependencies            |
| 🧾 **TypeScript support** | ✅ Native types                             | ⚠️ Community types (`@types/node-geocoder`) | ✅                                                      | ❌                        |
| 🧰 **Build targets**      | ESM + CJS                                   | CJS only (requires Babel for ESM)           | ESM + CJS                                               | CJS                       |
| ⚡ **Speed (cold call)**  | ~300–500 ms (native fetch)                  | ~500–800 ms (depending on provider)         | n/a                                                     | ~500 ms                   |
| 📦 **Size on install**    | ~20 KB                                      | ~250 KB                                     | ~100 KB                                                 | ~50 KB                    |
| 🧭 **Extra features**     | ✅ CLI, ✅ IP geolocation, ✅ Next.js-ready | Multi-provider switching                    | Distance/bearing math                                   | Just geocode/reverse      |
| 🧠 **Ease of use**        | One function call (`geocodePlace()`)        | Provider config required                    | Manual math utils                                       | Basic query builder       |
| 💬 **Docs clarity**       | Clean, readable README                      | Long, multi-provider config docs            | Moderate                                                | Minimal                   |
| 🤝 **License**            | MIT                                         | MIT                                         | MIT                                                     | MIT                       |

## Install

```bash
npm i quick-geocode
```

Uses native `fetch` (Node 18+). For older Node versions, polyfill `fetch` globally.

## Usage

### CLI (npx)

```bash
# Get coordinates for any place worldwide
npx quick-geocode "Washington, DC, USA"
# Output: {"lat":38.8950368,"lon":-77.0365427,"label":"Washington, District of Columbia, United States"}

npx quick-geocode "Sydney, Australia"
npx quick-geocode "Paris, France"
```

### Library

```ts
import { geocodeNominatim, reverseGeocodeNominatim, geocodePlace, lookupIp } from "quick-geocode";

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
const { geocodeNominatim, reverseGeocodeNominatim, lookupIp } = require("quick-geocode");

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

Issues and PRs welcome at https://github.com/next-dna/quick-geocode. Please run `npm run lint` and `npm run test` before submitting.

## License

MIT © 2025 Sandip Gami

## Author

- Name: Sandip Gami
- GitHub: https://github.com/next-dna
