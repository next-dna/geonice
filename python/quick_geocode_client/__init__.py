"""
quick-geocode-client: Python client for quick-geocode API

A language-independent geocoding library that works with any programming language
through a simple REST API.
"""

from .client import QuickGeocodeClient
from .models import GeocodeResult, IpLookupResult, Coordinates

__version__ = "0.2.0"
__author__ = "Sandip Gami"
__email__ = "sandip@next-dna.com"

__all__ = [
    "QuickGeocodeClient",
    "GeocodeResult", 
    "IpLookupResult",
    "Coordinates"
]
