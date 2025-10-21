import express from "express";
import cors from "cors";
import { geocodePlace, geocodeNominatim, reverseGeocodeNominatim, lookupIp } from "./index";
import { CONFIG } from "./config";

const app = express();
const PORT = process.env.PORT || CONFIG.DEFAULT_PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "quick-geocode-api", version: CONFIG.API_VERSION });
});

// Geocode endpoint - single place lookup
app.get("/geocode", async (req, res) => {
  try {
    const { query, userAgent } = req.query;

    if (!query) {
      return res.status(400).json({
        error: "Missing required parameter: query",
        example: "/geocode?query=Sydney, Australia",
      });
    }

    const result = await geocodePlace(query as string, {
      userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
    });

    if (!result) {
      return res.status(404).json({
        error: "No results found",
        query: query as string,
      });
    }

    res.json({
      success: true,
      query: query as string,
      result,
    });
  } catch (error) {
    console.error("Geocode error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Geocode multiple results endpoint
app.get("/geocode/search", async (req, res) => {
  try {
    const { query, userAgent, limit } = req.query;

    if (!query) {
      return res.status(400).json({
        error: "Missing required parameter: query",
        example: "/geocode/search?query=Sydney, Australia",
      });
    }

    const results = await geocodeNominatim(query as string, {
      userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
    });

    const limitedResults = limit ? results.slice(0, parseInt(limit as string)) : results;

    res.json({
      success: true,
      query: query as string,
      count: limitedResults.length,
      results: limitedResults,
    });
  } catch (error) {
    console.error("Geocode search error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reverse geocode endpoint
app.get("/reverse", async (req, res) => {
  try {
    const { lat, lon, userAgent, zoom } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: "Missing required parameters: lat and lon",
        example: "/reverse?lat=48.8584&lon=2.2945",
      });
    }

    const result = await reverseGeocodeNominatim(Number(lat), Number(lon), {
      userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
      zoom: zoom ? Number(zoom) : undefined,
    });

    res.json({
      success: true,
      coordinates: { lat: Number(lat), lon: Number(lon) },
      result,
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// IP lookup endpoint
app.get("/ip", async (req, res) => {
  try {
    const { ip } = req.query;

    const result = await lookupIp(ip as string);

    res.json({
      success: true,
      ip: ip || "current",
      result,
    });
  } catch (error) {
    console.error("IP lookup error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API documentation endpoint
app.get("/", (req, res) => {
  res.json({
    service: "quick-geocode-api",
    version: CONFIG.API_VERSION,
    description: "Language-independent geocoding API",
    endpoints: {
      "GET /health": "Health check",
      "GET /geocode?query=<place>": "Geocode a place (single result)",
      "GET /geocode/search?query=<place>&limit=<number>": "Geocode a place (multiple results)",
      "GET /reverse?lat=<number>&lon=<number>": "Reverse geocode coordinates",
      "GET /ip?ip=<ip_address>": "IP geolocation lookup",
    },
    examples: {
      geocode: "/geocode?query=Sydney, Australia",
      reverse: "/reverse?lat=48.8584&lon=2.2945",
      ip: "/ip?ip=8.8.8.8",
    },
    clients: {
      python: "pip install quick-geocode-client",
      java: `Add Maven dependency: com.quickgeocode:client:${CONFIG.CLIENT_VERSION}`,
      curl: 'curl "http://localhost:3000/geocode?query=Sydney, Australia"',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: ["/health", "/geocode", "/geocode/search", "/reverse", "/ip"],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 quick-geocode API server running on port ${PORT}`);
  console.log(`📖 API docs: http://localhost:${PORT}`);
  console.log(`🔍 Example: http://localhost:${PORT}/geocode?query=Sydney, Australia`);
});

export default app;
