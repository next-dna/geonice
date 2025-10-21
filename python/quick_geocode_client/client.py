"""
Main client for quick-geocode API
"""

import requests
from typing import Optional, List, Dict, Any
from .models import GeocodeResult, IpLookupResult, ApiResponse
from .config import DEFAULT_BASE_URL, DEFAULT_USER_AGENT, CLIENT_VERSION


class QuickGeocodeClient:
    """
    Python client for quick-geocode API
    
    Provides language-independent geocoding functionality through REST API.
    """
    
    def __init__(self, base_url: str = DEFAULT_BASE_URL, user_agent: str = f"{DEFAULT_USER_AGENT}/{CLIENT_VERSION}"):
        """
        Initialize the client
        
        Args:
            base_url: Base URL of the quick-geocode API server
            user_agent: User agent string for API requests
        """
        self.base_url = base_url.rstrip('/')
        self.user_agent = user_agent
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': user_agent,
            'Accept': 'application/json'
        })
    
    def _make_request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> ApiResponse:
        """Make HTTP request to API"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.get(url, params=params or {})
            response.raise_for_status()
            
            data = response.json()
            return ApiResponse(
                success=data.get('success', True),
                data=data,
                error=data.get('error'),
                message=data.get('message')
            )
        except requests.exceptions.RequestException as e:
            return ApiResponse(
                success=False,
                error=str(e),
                message="Network error occurred"
            )
        except Exception as e:
            return ApiResponse(
                success=False,
                error=str(e),
                message="Unexpected error occurred"
            )
    
    def geocode(self, query: str) -> Optional[GeocodeResult]:
        """
        Geocode a place name to coordinates
        
        Args:
            query: Place name (e.g., "Sydney, Australia")
            
        Returns:
            GeocodeResult or None if not found
        """
        response = self._make_request('/geocode', {'query': query})
        
        if not response.success or not response.data:
            return None
            
        result_data = response.data.get('result')
        if not result_data:
            return None
            
        return GeocodeResult.from_dict(result_data)
    
    def geocode_search(self, query: str, limit: Optional[int] = None) -> List[GeocodeResult]:
        """
        Search for multiple geocoding results
        
        Args:
            query: Place name to search
            limit: Maximum number of results
            
        Returns:
            List of GeocodeResult objects
        """
        params = {'query': query}
        if limit:
            params['limit'] = limit
            
        response = self._make_request('/geocode/search', params)
        
        if not response.success or not response.data:
            return []
            
        results_data = response.data.get('results', [])
        return [GeocodeResult.from_dict(result) for result in results_data]
    
    def reverse_geocode(self, lat: float, lon: float, zoom: Optional[int] = None) -> Optional[GeocodeResult]:
        """
        Reverse geocode coordinates to place name
        
        Args:
            lat: Latitude
            lon: Longitude
            zoom: Zoom level (0-18)
            
        Returns:
            GeocodeResult or None if not found
        """
        params = {'lat': lat, 'lon': lon}
        if zoom is not None:
            params['zoom'] = zoom
            
        response = self._make_request('/reverse', params)
        
        if not response.success or not response.data:
            return None
            
        result_data = response.data.get('result')
        if not result_data:
            return None
            
        return GeocodeResult.from_dict(result_data)
    
    def lookup_ip(self, ip: Optional[str] = None) -> Optional[IpLookupResult]:
        """
        Lookup IP address geolocation
        
        Args:
            ip: IP address to lookup (None for current IP)
            
        Returns:
            IpLookupResult or None if lookup failed
        """
        params = {}
        if ip:
            params['ip'] = ip
            
        response = self._make_request('/ip', params)
        
        if not response.success or not response.data:
            return None
            
        result_data = response.data.get('result')
        if not result_data:
            return None
            
        return IpLookupResult.from_dict(result_data)
    
    def health_check(self) -> bool:
        """
        Check if the API server is healthy
        
        Returns:
            True if server is healthy, False otherwise
        """
        response = self._make_request('/health')
        return response.success and response.data is not None
    
    def get_api_info(self) -> Optional[Dict[str, Any]]:
        """
        Get API server information
        
        Returns:
            API info dictionary or None if failed
        """
        response = self._make_request('/')
        return response.data if response.success else None


# Convenience functions for direct usage
def geocode(query: str, base_url: str = DEFAULT_BASE_URL) -> Optional[GeocodeResult]:
    """Quick geocoding function"""
    client = QuickGeocodeClient(base_url)
    return client.geocode(query)


def reverse_geocode(lat: float, lon: float, base_url: str = DEFAULT_BASE_URL) -> Optional[GeocodeResult]:
    """Quick reverse geocoding function"""
    client = QuickGeocodeClient(base_url)
    return client.reverse_geocode(lat, lon)


def lookup_ip(ip: Optional[str] = None, base_url: str = DEFAULT_BASE_URL) -> Optional[IpLookupResult]:
    """Quick IP lookup function"""
    client = QuickGeocodeClient(base_url)
    return client.lookup_ip(ip)
