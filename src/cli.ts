import { geocodePlace } from "./index";

async function main() {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error("Usage: geonice <place>");
    process.exit(1);
  }
  try {
    const result = await geocodePlace(query, { userAgent: "geonice-cli" });
    if (!result) {
      console.error("No results");
      process.exit(2);
    }
    // Print minimal JSON to stdout for easy piping
    process.stdout.write(
      JSON.stringify({ lat: result.lat, lon: result.lon, label: result.label }) + "\n",
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    process.exit(3);
  }
}

main();


