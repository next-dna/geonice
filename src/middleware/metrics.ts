import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics({ register });

// Custom metrics
export const metrics = {
  requests: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  }),
  
  requestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  cacheHits: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits'
  }),
  
  cacheMisses: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses'
  }),
  
  errors: new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type']
  }),
  
  geocodeRequests: new Counter({
    name: 'geocode_requests_total',
    help: 'Total number of geocoding requests',
    labelNames: ['type']
  })
};

export function prometheusMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Record request
  metrics.requests.inc({
    method: req.method,
    route: req.route?.path || req.path,
    status_code: res.statusCode
  });
  
  // Record geocoding requests
  if (req.path.includes('/geocode') || req.path.includes('/reverse') || req.path.includes('/ip')) {
    metrics.geocodeRequests.inc({
      type: req.path.includes('/reverse') ? 'reverse' : 
            req.path.includes('/ip') ? 'ip' : 'forward'
    });
  }
  
  // Override end to record duration
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = (Date.now() - start) / 1000;
    metrics.requestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    }, duration);
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

export { register };

// Export metrics object with register
export const metricsWithRegister = {
  ...metrics,
  register
};
