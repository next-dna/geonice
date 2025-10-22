import { Request, Response, NextFunction } from 'express';

export function cacheMiddleware(redis: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for health and metrics endpoints
    if (req.path === '/health' || req.path === '/metrics') {
      return next();
    }

    try {
      const cacheKey = `api:${req.path}:${JSON.stringify(req.query)}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        const data = JSON.parse(cached);
        return res.json({
          ...data,
          cached: true,
          cacheKey
        });
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(body: any) {
        // Cache successful responses
        if (res.statusCode === 200) {
          const cacheTime = req.path === '/reverse' ? 86400 : 3600; // 24h for reverse, 1h for others
          redis.setEx(cacheKey, cacheTime, JSON.stringify(body)).catch(console.error);
        }
        
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}
