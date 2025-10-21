package com.quickgeocode;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Java client for quick-geocode API
 * 
 * Provides language-independent geocoding functionality through REST API.
 */
public class QuickGeocodeClient {
    
    private final String baseUrl;
    private final String userAgent;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    /**
     * Initialize the client with default settings
     */
    public QuickGeocodeClient() {
        this("http://localhost:3000", "java-quick-geocode-client/0.2.0");
    }
    
    /**
     * Initialize the client with custom base URL
     * 
     * @param baseUrl Base URL of the quick-geocode API server
     */
    public QuickGeocodeClient(String baseUrl) {
        this(baseUrl, "java-quick-geocode-client/0.2.0");
    }
    
    /**
     * Initialize the client with custom settings
     * 
     * @param baseUrl Base URL of the quick-geocode API server
     * @param userAgent User agent string for API requests
     */
    public QuickGeocodeClient(String baseUrl, String userAgent) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.userAgent = userAgent;
        this.objectMapper = new ObjectMapper();
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();
    }
    
    /**
     * Geocode a place name to coordinates
     * 
     * @param query Place name (e.g., "Sydney, Australia")
     * @return GeocodeResult or null if not found
     * @throws QuickGeocodeException if API call fails
     */
    public GeocodeResult geocode(String query) throws QuickGeocodeException {
        try {
            String url = baseUrl + "/geocode?query=" + java.net.URLEncoder.encode(query, "UTF-8");
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new QuickGeocodeException("HTTP " + response.code() + ": " + response.message());
                }
                
                ResponseBody body = response.body();
                if (body == null) {
                    return null;
                }
                
                String json = body.string();
                ApiResponse apiResponse = objectMapper.readValue(json, ApiResponse.class);
                
                if (!apiResponse.isSuccess() || apiResponse.getResult() == null) {
                    return null;
                }
                
                return apiResponse.getResult();
            }
        } catch (IOException e) {
            throw new QuickGeocodeException("Network error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Search for multiple geocoding results
     * 
     * @param query Place name to search
     * @param limit Maximum number of results
     * @return List of GeocodeResult objects
     * @throws QuickGeocodeException if API call fails
     */
    public List<GeocodeResult> geocodeSearch(String query, Integer limit) throws QuickGeocodeException {
        try {
            String url = baseUrl + "/geocode/search?query=" + java.net.URLEncoder.encode(query, "UTF-8");
            if (limit != null) {
                url += "&limit=" + limit;
            }
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new QuickGeocodeException("HTTP " + response.code() + ": " + response.message());
                }
                
                ResponseBody body = response.body();
                if (body == null) {
                    return java.util.Collections.emptyList();
                }
                
                String json = body.string();
                SearchApiResponse apiResponse = objectMapper.readValue(json, SearchApiResponse.class);
                
                if (!apiResponse.isSuccess()) {
                    return java.util.Collections.emptyList();
                }
                
                return apiResponse.getResults();
            }
        } catch (IOException e) {
            throw new QuickGeocodeException("Network error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Reverse geocode coordinates to place name
     * 
     * @param lat Latitude
     * @param lon Longitude
     * @param zoom Zoom level (0-18)
     * @return GeocodeResult or null if not found
     * @throws QuickGeocodeException if API call fails
     */
    public GeocodeResult reverseGeocode(double lat, double lon, Integer zoom) throws QuickGeocodeException {
        try {
            String url = baseUrl + "/reverse?lat=" + lat + "&lon=" + lon;
            if (zoom != null) {
                url += "&zoom=" + zoom;
            }
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new QuickGeocodeException("HTTP " + response.code() + ": " + response.message());
                }
                
                ResponseBody body = response.body();
                if (body == null) {
                    return null;
                }
                
                String json = body.string();
                ReverseApiResponse apiResponse = objectMapper.readValue(json, ReverseApiResponse.class);
                
                if (!apiResponse.isSuccess() || apiResponse.getResult() == null) {
                    return null;
                }
                
                return apiResponse.getResult();
            }
        } catch (IOException e) {
            throw new QuickGeocodeException("Network error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lookup IP address geolocation
     * 
     * @param ip IP address to lookup (null for current IP)
     * @return IpLookupResult or null if lookup failed
     * @throws QuickGeocodeException if API call fails
     */
    public IpLookupResult lookupIp(String ip) throws QuickGeocodeException {
        try {
            String url = baseUrl + "/ip";
            if (ip != null) {
                url += "?ip=" + java.net.URLEncoder.encode(ip, "UTF-8");
            }
            
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new QuickGeocodeException("HTTP " + response.code() + ": " + response.message());
                }
                
                ResponseBody body = response.body();
                if (body == null) {
                    return null;
                }
                
                String json = body.string();
                IpApiResponse apiResponse = objectMapper.readValue(json, IpApiResponse.class);
                
                if (!apiResponse.isSuccess() || apiResponse.getResult() == null) {
                    return null;
                }
                
                return apiResponse.getResult();
            }
        } catch (IOException e) {
            throw new QuickGeocodeException("Network error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Check if the API server is healthy
     * 
     * @return true if server is healthy, false otherwise
     */
    public boolean healthCheck() {
        try {
            String url = baseUrl + "/health";
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                return response.isSuccessful();
            }
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get API server information
     * 
     * @return API info or null if failed
     * @throws QuickGeocodeException if API call fails
     */
    public ApiInfo getApiInfo() throws QuickGeocodeException {
        try {
            String url = baseUrl + "/";
            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("User-Agent", userAgent)
                    .addHeader("Accept", "application/json")
                    .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new QuickGeocodeException("HTTP " + response.code() + ": " + response.message());
                }
                
                ResponseBody body = response.body();
                if (body == null) {
                    return null;
                }
                
                String json = body.string();
                return objectMapper.readValue(json, ApiInfo.class);
            }
        } catch (IOException e) {
            throw new QuickGeocodeException("Network error: " + e.getMessage(), e);
        }
    }
}
