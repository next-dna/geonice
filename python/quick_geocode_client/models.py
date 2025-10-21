"""
Data models for quick-geocode-client
"""

from typing import Optional, List, Dict, Any
from dataclasses import dataclass


@dataclass
class Coordinates:
    """Geographic coordinates"""
    lat: float
    lon: float


@dataclass
class BoundingBox:
    """Geographic bounding box"""
    north: float
    south: float
    east: float
    west: float


@dataclass
class GeocodeResult:
    """Geocoding result"""
    lat: float
    lon: float
    label: str
    bounding_box: Optional[BoundingBox] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GeocodeResult':
        """Create from API response dictionary"""
        bounding_box = None
        if 'boundingBox' in data and data['boundingBox']:
            bb = data['boundingBox']
            bounding_box = BoundingBox(
                north=bb['north'],
                south=bb['south'],
                east=bb['east'],
                west=bb['west']
            )
        
        return cls(
            lat=data['lat'],
            lon=data['lon'],
            label=data['label'],
            bounding_box=bounding_box
        )


@dataclass
class IpLookupResult:
    """IP geolocation result"""
    lat: float
    lon: float
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postal: Optional[str] = None
    timezone: Optional[str] = None
    asn: Optional[str] = None
    org: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'IpLookupResult':
        """Create from API response dictionary"""
        return cls(
            lat=data['lat'],
            lon=data['lon'],
            city=data.get('city'),
            region=data.get('region'),
            country=data.get('country'),
            postal=data.get('postal'),
            timezone=data.get('timezone'),
            asn=data.get('asn'),
            org=data.get('org')
        )


@dataclass
class ApiResponse:
    """Generic API response wrapper"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None
