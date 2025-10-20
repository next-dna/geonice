# geonice

A minimal, zero-dependency TypeScript geolocation toolkit for Node and Next.js:

- Geocoding & reverse-geocoding via OpenStreetMap Nominatim
- IP geolocation via ipapi.co
- ESM + CJS builds, strict types, Node 18+ native fetch

Repository: https://github.com/next-dna/geonice

Node support: >=18

## Install

```bash
npm i geonice
```

Peer dependency: `undici` for environments without global `fetch`.

```bash
npm i undici
```

In Node: `import { fetch } from "undici"; globalThis.fetch = fetch as any;`

## Usage

```ts
import { geocodeNominatim, reverseGeocodeNominatim, geocodePlace, lookupIp } from "geonice";

const results = await geocodeNominatim("Eiffel Tower", { userAgent: "your-app/1.0" });
const place = await reverseGeocodeNominatim(48.8584, 2.2945);
const ip = await lookupIp();

// Convenience: city/state/country in one string
const sydney = await geocodePlace("Sydney, Australia", { userAgent: "your-app/1.0" });
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

- `geocodeNominatim(query, opts?) => Promise<GeocodeResult[]>`
- `reverseGeocodeNominatim(lat, lon, opts?) => Promise<GeocodeResult>`
- `lookupIp(ip?, opts?) => Promise<IpLookupResult>`

Types exported: `Coordinates`, `GeocodeResult`, `GeocodeOptions`, `ReverseGeocodeOptions`, `IpLookupResult`.

## Respect provider usage policies

- Nominatim requires a valid `User-Agent` identifying your application.
- Be considerate with request frequency; add caching and backoff in production.
  - For Nominatim, include a descriptive `User-Agent` and follow their usage policy.
  - For ipapi.co, expect public endpoints to rate limit; consider paid tiers for production.

## Build & Publish (npm)

1. Ensure you are logged in:
   ```bash
   npm login
   ```
2. Update `package.json` fields: `name`, `version`, `author`, `repository`, `homepage`, `bugs`.
3. Build:
   ```bash
   npm run build
   ```
4. Publish:
   ```bash
   npm publish --access public
   ```

## Local development

```bash
npm install
npm run lint
npm run test
npm run build
node -e "import(./dist/index.js).then(m=>console.log(Object.keys(m)))"
```

If your Node environment lacks a global `fetch`, set it up:

```ts
import { fetch } from "undici";
// @ts-ignore
globalThis.fetch = fetch;
```

## Contributing

Issues and PRs welcome at https://github.com/next-dna/geonice. Please run `npm run lint` and `npm run test` before submitting.

## License

MIT © 2025 Sandip Gami

## Author

- Name: Sandip Gami
- GitHub: https://github.com/next-dna
