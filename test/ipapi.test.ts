import { describe, it, expect } from "vitest";
import { lookupIp } from "../src/providers/ipapi";

describe("lookupIp", () => {
  it("returns coordinates for current IP", async () => {
    try {
      const res = await lookupIp();
      expect(typeof res.lat).toBe("number");
      expect(typeof res.lon).toBe("number");
    } catch (err: any) {
      // Skip when the public provider rate-limits CI/local runs
      if (typeof err?.message === "string" && err.message.includes("429")) {
        return;
      }
      throw err;
    }
  });
});


