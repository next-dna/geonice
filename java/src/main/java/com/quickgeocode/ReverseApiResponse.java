package com.quickgeocode;

/**
 * API response for reverse geocoding
 */
public class ReverseApiResponse {
    
    private boolean success;
    private GeocodeResult result;
    private String error;
    private String message;
    
    public ReverseApiResponse() {}
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public GeocodeResult getResult() {
        return result;
    }
    
    public void setResult(GeocodeResult result) {
        this.result = result;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
