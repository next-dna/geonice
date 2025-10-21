package com.quickgeocode;

/**
 * Exception thrown by QuickGeocodeClient
 */
public class QuickGeocodeException extends Exception {
    
    public QuickGeocodeException(String message) {
        super(message);
    }
    
    public QuickGeocodeException(String message, Throwable cause) {
        super(message, cause);
    }
}
