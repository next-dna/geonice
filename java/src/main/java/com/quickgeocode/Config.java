package com.quickgeocode;

/**
 * Configuration constants for quick-geocode Java client
 */
public class Config {
    
    // Default configuration
    public static final String DEFAULT_BASE_URL = "http://localhost:3000";
    public static final String DEFAULT_USER_AGENT = "java-quick-geocode-client";
    public static final String CLIENT_VERSION = "0.2.0";
    
    // Private constructor to prevent instantiation
    private Config() {
        throw new UnsupportedOperationException("Utility class");
    }
}
