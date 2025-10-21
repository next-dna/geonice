/**
 * Centralized configuration for quick-geocode
 */

export const CONFIG = {
  // API Server Configuration
  DEFAULT_BASE_URL: "http://localhost:3000",
  DEFAULT_PORT: 3000,
  
  // Client Configuration
  DEFAULT_USER_AGENT: "quick-geocode-client",
  
  // API Versions
  API_VERSION: "0.2.0",
  CLIENT_VERSION: "0.2.0",
} as const;

export type Config = typeof CONFIG;
