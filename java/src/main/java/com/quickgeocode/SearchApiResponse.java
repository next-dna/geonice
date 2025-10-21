package com.quickgeocode;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * API response for search endpoints
 */
public class SearchApiResponse {
    
    private boolean success;
    private List<GeocodeResult> results;
    private String error;
    private String message;
    
    public SearchApiResponse() {}
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public List<GeocodeResult> getResults() {
        return results;
    }
    
    public void setResults(List<GeocodeResult> results) {
        this.results = results;
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
