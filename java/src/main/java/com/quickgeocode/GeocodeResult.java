package com.quickgeocode;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Geocoding result
 */
public class GeocodeResult {
    
    private double lat;
    private double lon;
    private String label;
    private BoundingBox boundingBox;
    
    public GeocodeResult() {}
    
    public GeocodeResult(double lat, double lon, String label) {
        this.lat = lat;
        this.lon = lon;
        this.label = label;
    }
    
    public double getLat() {
        return lat;
    }
    
    public void setLat(double lat) {
        this.lat = lat;
    }
    
    public double getLon() {
        return lon;
    }
    
    public void setLon(double lon) {
        this.lon = lon;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    @JsonProperty("boundingBox")
    public BoundingBox getBoundingBox() {
        return boundingBox;
    }
    
    public void setBoundingBox(BoundingBox boundingBox) {
        this.boundingBox = boundingBox;
    }
    
    @Override
    public String toString() {
        return "GeocodeResult{" +
                "lat=" + lat +
                ", lon=" + lon +
                ", label='" + label + '\'' +
                ", boundingBox=" + boundingBox +
                '}';
    }
}
