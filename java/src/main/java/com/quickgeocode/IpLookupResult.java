package com.quickgeocode;

/**
 * IP geolocation result
 */
public class IpLookupResult {
    
    private double lat;
    private double lon;
    private String city;
    private String region;
    private String country;
    private String postal;
    private String timezone;
    private String asn;
    private String org;
    
    public IpLookupResult() {}
    
    public IpLookupResult(double lat, double lon) {
        this.lat = lat;
        this.lon = lon;
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
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getPostal() {
        return postal;
    }
    
    public void setPostal(String postal) {
        this.postal = postal;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public String getAsn() {
        return asn;
    }
    
    public void setAsn(String asn) {
        this.asn = asn;
    }
    
    public String getOrg() {
        return org;
    }
    
    public void setOrg(String org) {
        this.org = org;
    }
    
    @Override
    public String toString() {
        return "IpLookupResult{" +
                "lat=" + lat +
                ", lon=" + lon +
                ", city='" + city + '\'' +
                ", region='" + region + '\'' +
                ", country='" + country + '\'' +
                ", postal='" + postal + '\'' +
                ", timezone='" + timezone + '\'' +
                ", asn='" + asn + '\'' +
                ", org='" + org + '\'' +
                '}';
    }
}
