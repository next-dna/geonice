# Language-Independent Geocoding

Make your `quick-geocode` library accessible to **any programming language** through a REST API service.

## 🚀 Quick Start

### 1. Start the API Server

```bash
# Install dependencies
npm install

# Start development server
npm run server

# Or build and start production server
npm run build
npm start
```

### 2. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Geocode a place
curl "http://localhost:3000/geocode?query=Sydney, Australia"

# Reverse geocode
curl "http://localhost:3000/reverse?lat=48.8584&lon=2.2945"

# IP lookup
curl "http://localhost:3000/ip?ip=8.8.8.8"
```

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t quick-geocode-api .

# Run container
docker run -p 3000:3000 quick-geocode-api

# Or with docker-compose
docker-compose up
```

## 📚 Client Libraries

### Python

```bash
# Install Python client
pip install quick-geocode-client

# Or from source
cd python
pip install -e .
```

**Usage:**

```python
from quick_geocode_client import QuickGeocodeClient, geocode

# Using client class
client = QuickGeocodeClient("http://localhost:3000")
result = client.geocode("Sydney, Australia")
print(f"Lat: {result.lat}, Lon: {result.lon}")

# Using convenience functions
result = geocode("Paris, France")
print(result.label)

# CLI usage
quick-geocode "Sydney, Australia"
```

### Java

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>com.quickgeocode</groupId>
    <artifactId>quick-geocode-client</artifactId>
    <version>0.2.0</version>
</dependency>
```

**Usage:**

```java
import com.quickgeocode.QuickGeocodeClient;
import com.quickgeocode.GeocodeResult;

QuickGeocodeClient client = new QuickGeocodeClient("http://localhost:3000");
GeocodeResult result = client.geocode("Sydney, Australia");
System.out.println("Lat: " + result.getLat() + ", Lon: " + result.getLon());
```

### Any Language with HTTP

**cURL:**

```bash
curl "http://localhost:3000/geocode?query=Sydney, Australia"
```

**JavaScript/Node.js:**

```javascript
const response = await fetch("http://localhost:3000/geocode?query=Sydney, Australia");
const data = await response.json();
console.log(data.result);
```

**Go:**

```go
resp, err := http.Get("http://localhost:3000/geocode?query=Sydney, Australia")
// Handle response...
```

**Rust:**

```rust
let response = reqwest::get("http://localhost:3000/geocode?query=Sydney, Australia").await?;
let data: serde_json::Value = response.json().await?;
```

## 🔧 API Endpoints

| Endpoint          | Method | Description                | Parameters                        |
| ----------------- | ------ | -------------------------- | --------------------------------- |
| `/health`         | GET    | Health check               | -                                 |
| `/geocode`        | GET    | Single geocoding result    | `query`, `userAgent`              |
| `/geocode/search` | GET    | Multiple geocoding results | `query`, `limit`, `userAgent`     |
| `/reverse`        | GET    | Reverse geocoding          | `lat`, `lon`, `zoom`, `userAgent` |
| `/ip`             | GET    | IP geolocation             | `ip`, `userAgent`                 |

## 📦 Response Format

### Geocoding Response

```json
{
  "success": true,
  "query": "Sydney, Australia",
  "result": {
    "lat": -33.8698439,
    "lon": 151.2082848,
    "label": "Sydney, Council of the City of Sydney, New South Wales, Australia",
    "boundingBox": {
      "north": -33.8698439,
      "south": -33.8698439,
      "east": 151.2082848,
      "west": 151.2082848
    }
  }
}
```

### IP Lookup Response

```json
{
  "success": true,
  "ip": "8.8.8.8",
  "result": {
    "lat": 37.386,
    "lon": -122.0838,
    "city": "Mountain View",
    "region": "California",
    "country": "United States",
    "postal": "94043",
    "timezone": "America/Los_Angeles",
    "asn": "AS15169",
    "org": "Google LLC"
  }
}
```

## 🌐 Cloud Deployment

### Heroku

```bash
# Add to package.json
"scripts": {
  "start": "node dist/server.cjs"
}

# Deploy
git push heroku main
```

### AWS/GCP/Azure

```bash
# Build Docker image
docker build -t quick-geocode-api .

# Push to registry
docker tag quick-geocode-api your-registry/quick-geocode-api
docker push your-registry/quick-geocode-api

# Deploy to cloud service
```

### Railway

```bash
# Connect GitHub repo
# Railway will auto-deploy from Dockerfile
```

## 🔒 Production Considerations

1. **Rate Limiting**: Add rate limiting middleware
2. **Authentication**: Add API key authentication
3. **Caching**: Add Redis/Memcached for response caching
4. **Monitoring**: Add health checks and metrics
5. **Load Balancing**: Use multiple instances behind a load balancer

## 🧪 Testing

```bash
# Test API server
npm run server &
curl "http://localhost:3000/geocode?query=Sydney, Australia"

# Test Python client
cd python
python -m pytest

# Test Java client
cd java
mvn test
```

## 📈 Scaling

- **Horizontal**: Deploy multiple API instances
- **Caching**: Cache responses to reduce API calls
- **CDN**: Use CDN for static assets
- **Database**: Store frequently requested locations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📄 License

MIT © 2025 Sandip Gami
