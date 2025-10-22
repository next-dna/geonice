import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { geocodePlace, geocodeNominatim, reverseGeocodeNominatim, lookupIp } from "./index";
import { CONFIG } from "./config";

const app = express();
const PORT = process.env.PORT || CONFIG.DEFAULT_PORT;

// Simple in-memory cache
const cache = new Map<string, { data: any; expires: number }>();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  message: {
    error: "Too many requests",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Simple cache middleware
function getFromCache(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

function setCache(key: string, data: any, ttlSeconds: number) {
  cache.set(key, {
    data,
    expires: Date.now() + (ttlSeconds * 1000)
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "quick-geocode-api", 
    version: CONFIG.API_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cacheSize: cache.size,
    timestamp: new Date().toISOString()
  });
});

// Geocode endpoint with simple caching
app.get("/geocode", async (req, res) => {
  const startTime = Date.now();
  const { query, userAgent } = req.query;
  
  try {
    if (!query) {
      return res.status(400).json({
        error: "Missing required parameter: query",
        example: "/geocode?query=Sydney, Australia",
      });
    }

    const cacheKey = `geocode:${encodeURIComponent(query as string)}`;
    
    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        query: query as string,
        result: cached,
        cached: true,
        responseTime: Date.now() - startTime
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

    // Cache for 1 hour
    setCache(cacheKey, result, 3600);

    res.json({
      success: true,
      query: query as string,
      result,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    console.error("Geocode error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Search endpoint
app.get("/geocode/search", async (req, res) => {
  const startTime = Date.now();
  const { query, userAgent, limit } = req.query;
  
  try {
    if (!query) {
      return res.status(400).json({
        error: "Missing required parameter: query",
        example: "/geocode/search?query=Sydney, Australia",
      });
    }

    const cacheKey = `search:${encodeURIComponent(query as string)}:${limit || '5'}`;
    
    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        query: query as string,
        count: cached.length,
        results: cached,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    const results = await geocodeNominatim(query as string, {
      userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
    });
    
    const limitedResults = limit ? results.slice(0, parseInt(limit as string)) : results;

    // Cache for 1 hour
    setCache(cacheKey, limitedResults, 3600);

    res.json({
      success: true,
      query: query as string,
      count: limitedResults.length,
      results: limitedResults,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reverse geocode endpoint
app.get("/reverse", async (req, res) => {
  const startTime = Date.now();
  const { lat, lon, userAgent, zoom } = req.query;
  
  try {
    if (!lat || !lon) {
      return res.status(400).json({
        error: "Missing required parameters: lat and lon",
        example: "/reverse?lat=48.8584&lon=2.2945",
      });
    }

    const cacheKey = `reverse:${lat}:${lon}:${zoom || 'default'}`;
    
    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        coordinates: { lat: Number(lat), lon: Number(lon) },
        result: cached,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    const result = await reverseGeocodeNominatim(
      Number(lat), 
      Number(lon), 
      { 
        userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
        zoom: zoom ? Number(zoom) : undefined
      }
    );

    // Cache for 24 hours
    setCache(cacheKey, result, 86400);

    res.json({
      success: true,
      coordinates: { lat: Number(lat), lon: Number(lon) },
      result,
      cached: false,
      responseTime: Date.now() - startTime
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
  const startTime = Date.now();
  const { ip } = req.query;
  
  try {
    const cacheKey = `ip:${ip || 'current'}`;
    
    // Check cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ip: ip || 'current',
        result: cached,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    const result = await lookupIp(ip as string);

    // Cache for 1 hour
    setCache(cacheKey, result, 3600);

    res.json({
      success: true,
      ip: ip || 'current',
      result,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    console.error("IP lookup error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API documentation
app.get("/", (req, res) => {
  res.json({
    service: "quick-geocode-api",
    version: CONFIG.API_VERSION,
    description: "High-performance geocoding API with in-memory caching",
    features: [
      "In-memory caching",
      "Rate limiting", 
      "Request logging",
      "Compression",
      "Security headers"
    ],
    endpoints: {
      "GET /health": "Health check with system info",
      "GET /geocode?query=<place>": "Geocode a place (cached)",
      "GET /geocode/search?query=<place>&limit=<number>": "Search places (cached)",
      "GET /reverse?lat=<number>&lon=<number>": "Reverse geocode (cached)",
      "GET /ip?ip=<ip_address>": "IP geolocation (cached)"
    },
    limits: {
      "rateLimit": "100 requests per 15 minutes",
      "cache": "1 hour for geocoding, 24 hours for reverse geocoding"
    }
  });
});

// Error handling
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
    availableEndpoints: ["/health", "/geocode", "/geocode/search", "/reverse", "/ip"]
  });
});

// Clean up cache every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expires <= now) {
      cache.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1 hour

app.listen(PORT, () => {
  console.log(`🚀 Production quick-geocode API server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Example: http://localhost:${PORT}/geocode?query=Sydney, Australia`);
});

export default app;
