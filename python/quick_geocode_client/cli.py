"""
Command-line interface for quick-geocode-client
"""

import argparse
import json
import sys
from typing import Optional
from .client import QuickGeocodeClient


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="quick-geocode Python client CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  quick-geocode "Sydney, Australia"
  quick-geocode --reverse --lat 48.8584 --lon 2.2945
  quick-geocode --ip 8.8.8.8
  quick-geocode --server http://api.example.com "Paris, France"
        """
    )
    
    # Server configuration
    parser.add_argument(
        '--server', 
        default='http://localhost:3000',
        help='API server URL (default: http://localhost:3000)'
    )
    
    # Geocoding
    parser.add_argument(
        'query',
        nargs='?',
        help='Place name to geocode'
    )
    
    # Reverse geocoding
    parser.add_argument(
        '--reverse',
        action='store_true',
        help='Reverse geocode coordinates'
    )
    parser.add_argument(
        '--lat',
        type=float,
        help='Latitude for reverse geocoding'
    )
    parser.add_argument(
        '--lon',
        type=float,
        help='Longitude for reverse geocoding'
    )
    parser.add_argument(
        '--zoom',
        type=int,
        help='Zoom level for reverse geocoding (0-18)'
    )
    
    # IP lookup
    parser.add_argument(
        '--ip',
        help='IP address to lookup (omit for current IP)'
    )
    
    # Search options
    parser.add_argument(
        '--search',
        action='store_true',
        help='Search for multiple results'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of search results'
    )
    
    # Output options
    parser.add_argument(
        '--format',
        choices=['json', 'simple'],
        default='json',
        help='Output format (default: json)'
    )
    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Suppress error messages'
    )
    
    args = parser.parse_args()
    
    # Initialize client
    client = QuickGeocodeClient(args.server)
    
    # Check server health
    if not client.health_check():
        if not args.quiet:
            print(f"Error: Cannot connect to server at {args.server}", file=sys.stderr)
        sys.exit(1)
    
    try:
        if args.reverse:
            # Reverse geocoding
            if args.lat is None or args.lon is None:
                if not args.quiet:
                    print("Error: --lat and --lon are required for reverse geocoding", file=sys.stderr)
                sys.exit(1)
            
            result = client.reverse_geocode(args.lat, args.lon, args.zoom)
            if result:
                if args.format == 'simple':
                    print(f"{result.lat},{result.lon},{result.label}")
                else:
                    print(json.dumps({
                        'lat': result.lat,
                        'lon': result.lon,
                        'label': result.label
                    }))
            else:
                if not args.quiet:
                    print("No results found", file=sys.stderr)
                sys.exit(1)
                
        elif args.ip is not None or '--ip' in sys.argv:
            # IP lookup
            result = client.lookup_ip(args.ip)
            if result:
                if args.format == 'simple':
                    print(f"{result.lat},{result.lon},{result.city},{result.country}")
                else:
                    print(json.dumps({
                        'lat': result.lat,
                        'lon': result.lon,
                        'city': result.city,
                        'region': result.region,
                        'country': result.country,
                        'postal': result.postal,
                        'timezone': result.timezone
                    }))
            else:
                if not args.quiet:
                    print("IP lookup failed", file=sys.stderr)
                sys.exit(1)
                
        elif args.query:
            # Geocoding
            if args.search:
                # Multiple results
                results = client.geocode_search(args.query, args.limit)
                if results:
                    if args.format == 'simple':
                        for result in results:
                            print(f"{result.lat},{result.lon},{result.label}")
                    else:
                        print(json.dumps([{
                            'lat': result.lat,
                            'lon': result.lon,
                            'label': result.label
                        } for result in results]))
                else:
                    if not args.quiet:
                        print("No results found", file=sys.stderr)
                    sys.exit(1)
            else:
                # Single result
                result = client.geocode(args.query)
                if result:
                    if args.format == 'simple':
                        print(f"{result.lat},{result.lon},{result.label}")
                    else:
                        print(json.dumps({
                            'lat': result.lat,
                            'lon': result.lon,
                            'label': result.label
                        }))
                else:
                    if not args.quiet:
                        print("No results found", file=sys.stderr)
                    sys.exit(1)
        else:
            # No arguments provided
            parser.print_help()
            sys.exit(1)
            
    except KeyboardInterrupt:
        if not args.quiet:
            print("\nOperation cancelled", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        if not args.quiet:
            print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
