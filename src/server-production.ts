import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import { geocodePlace, geocodeNominatim, reverseGeocodeNominatim, lookupIp } from "./index";
import { CONFIG } from "./config";
import { createClient } from "redis";
import { prometheusMiddleware, metrics, register } from "./middleware/metrics";
import { cacheMiddleware } from "./middleware/cache";
import { logger, requestLogger } from "./middleware/logger";

const app = express();
const PORT = process.env.PORT || CONFIG.DEFAULT_PORT;

// Redis client for caching
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Connect to Redis
redis.connect().catch(console.error);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS with production settings
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100, // requests per window
  message: {
    error: "Too many requests",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Metrics middleware
app.use(prometheusMiddleware);

// Cache middleware
app.use(cacheMiddleware(redis));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "quick-geocode-api", 
    version: CONFIG.API_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(register.metrics());
});

// Geocode endpoint with caching
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
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      metrics.cacheHits.inc();
      return res.json({
        success: true,
        query: query as string,
        result,
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

    // Cache the result for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));
    metrics.cacheMisses.inc();

    res.json({
      success: true,
      query: query as string,
      result,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error("Geocode error:", error);
    metrics.errors.inc();
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Search endpoint with caching
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
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      metrics.cacheHits.inc();
      return res.json({
        success: true,
        query: query as string,
        count: data.length,
        results: data,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    const results = await geocodeNominatim(query as string, {
      userAgent: (userAgent as string) || `${CONFIG.DEFAULT_USER_AGENT}/${CONFIG.API_VERSION}`,
    });
    
    const limitedResults = limit ? results.slice(0, parseInt(limit as string)) : results;

    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(limitedResults));
    metrics.cacheMisses.inc();

    res.json({
      success: true,
      query: query as string,
      count: limitedResults.length,
      results: limitedResults,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error("Search error:", error);
    metrics.errors.inc();
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reverse geocode endpoint with caching
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
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      metrics.cacheHits.inc();
      return res.json({
        success: true,
        coordinates: { lat: Number(lat), lon: Number(lon) },
        result,
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

    // Cache for 24 hours (reverse geocoding is more stable)
    await redis.setEx(cacheKey, 86400, JSON.stringify(result));
    metrics.cacheMisses.inc();

    res.json({
      success: true,
      coordinates: { lat: Number(lat), lon: Number(lon) },
      result,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error("Reverse geocode error:", error);
    metrics.errors.inc();
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// IP lookup endpoint with caching
app.get("/ip", async (req, res) => {
  const startTime = Date.now();
  const { ip } = req.query;
  
  try {
    const cacheKey = `ip:${ip || 'current'}`;
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      metrics.cacheHits.inc();
      return res.json({
        success: true,
        ip: ip || 'current',
        result,
        cached: true,
        responseTime: Date.now() - startTime
      });
    }

    const result = await lookupIp(ip as string);

    // Cache for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));
    metrics.cacheMisses.inc();

    res.json({
      success: true,
      ip: ip || 'current',
      result,
      cached: false,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error("IP lookup error:", error);
    metrics.errors.inc();
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
    description: "High-performance, language-independent geocoding API",
    features: [
      "Redis caching",
      "Rate limiting", 
      "Metrics & monitoring",
      "Request logging",
      "Compression",
      "Security headers"
    ],
    endpoints: {
      "GET /health": "Health check with system info",
      "GET /metrics": "Prometheus metrics",
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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  logger.error("Unhandled error:", err);
  metrics.errors.inc();
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: ["/health", "/metrics", "/geocode", "/geocode/search", "/reverse", "/ip"]
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await redis.quit();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`🚀 Production quick-geocode API server running on port ${PORT}`);
  logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
  logger.info(`🔍 Example: http://localhost:${PORT}/geocode?query=Sydney, Australia`);
});

export default app;
