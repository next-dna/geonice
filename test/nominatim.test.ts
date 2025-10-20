import { describe, it, expect } from "vitest";
import { geocodeNominatim, reverseGeocodeNominatim } from "../src/providers/nominatim";

describe("Nominatim", () => {
  it("geocodes a well-known landmark", async () => {
    const results = await geocodeNominatim("Eiffel Tower, Paris", { userAgent: "geonice-tests" });
    expect(results.length).toBeGreaterThan(0);
    expect(typeof results[0].lat).toBe("number");
    expect(typeof results[0].lon).toBe("number");
  });

  it("reverse geocodes coordinates", async () => {
    const res = await reverseGeocodeNominatim(48.8584, 2.2945, { userAgent: "geonice-tests" });
    expect(res.label).toBeDefined();
    expect(typeof res.lat).toBe("number");
    expect(typeof res.lon).toBe("number");
  });
});


