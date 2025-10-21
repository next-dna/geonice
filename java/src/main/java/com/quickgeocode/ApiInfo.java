package com.quickgeocode;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * API server information
 */
public class ApiInfo {
    
    private String service;
    private String version;
    private String description;
    private Map<String, String> endpoints;
    private Map<String, String> examples;
    private Map<String, String> clients;
    
    public ApiInfo() {}
    
    public String getService() {
        return service;
    }
    
    public void setService(String service) {
        this.service = service;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Map<String, String> getEndpoints() {
        return endpoints;
    }
    
    public void setEndpoints(Map<String, String> endpoints) {
        this.endpoints = endpoints;
    }
    
    public Map<String, String> getExamples() {
        return examples;
    }
    
    public void setExamples(Map<String, String> examples) {
        this.examples = examples;
    }
    
    public Map<String, String> getClients() {
        return clients;
    }
    
    public void setClients(Map<String, String> clients) {
        this.clients = clients;
    }
}
