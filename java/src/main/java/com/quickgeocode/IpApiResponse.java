package com.quickgeocode;

/**
 * API response for IP lookup
 */
public class IpApiResponse {
    
    private boolean success;
    private IpLookupResult result;
    private String error;
    private String message;
    
    public IpApiResponse() {}
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public IpLookupResult getResult() {
        return result;
    }
    
    public void setResult(IpLookupResult result) {
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
