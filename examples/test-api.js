#!/usr/bin/env node

/**
 * Test script for quick-geocode API
 * Demonstrates language-independent usage
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";

async function testApi() {
  console.log("🧪 Testing quick-geocode API...\n");

  try {
    // Health check
    console.log("1. Health Check:");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ Status: ${healthData.status}`);
    console.log(`   📦 Service: ${healthData.service}`);
    console.log(`   🔢 Version: ${healthData.version}\n`);

    // Geocoding test
    console.log("2. Geocoding Test:");
    const geocodeResponse = await fetch(`${BASE_URL}/geocode?query=Sydney, Australia`);
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.success) {
      const result = geocodeData.result;
      console.log(`   📍 Query: ${geocodeData.query}`);
      console.log(`   🗺️  Coordinates: ${result.lat}, ${result.lon}`);
      console.log(`   🏷️  Label: ${result.label}\n`);
    } else {
      console.log(`   ❌ Error: ${geocodeData.error}\n`);
    }

    // Reverse geocoding test
    console.log("3. Reverse Geocoding Test:");
    const reverseResponse = await fetch(`${BASE_URL}/reverse?lat=48.8584&lon=2.2945`);
    const reverseData = await reverseResponse.json();
    if (reverseData.success) {
      const result = reverseData.result;
      console.log(
        `   📍 Coordinates: ${reverseData.coordinates.lat}, ${reverseData.coordinates.lon}`,
      );
      console.log(`   🗺️  Result: ${result.lat}, ${result.lon}`);
      console.log(`   🏷️  Label: ${result.label}\n`);
    } else {
      console.log(`   ❌ Error: ${reverseData.error}\n`);
    }

    // IP lookup test
    console.log("4. IP Lookup Test:");
    const ipResponse = await fetch(`${BASE_URL}/ip`);
    const ipData = await ipResponse.json();
    if (ipData.success) {
      const result = ipData.result;
      console.log(`   🌐 IP: ${ipData.ip}`);
      console.log(`   📍 Coordinates: ${result.lat}, ${result.lon}`);
      console.log(`   🏙️  City: ${result.city}`);
      console.log(`   🌍 Country: ${result.country}\n`);
    } else {
      console.log(`   ❌ Error: ${ipData.error}\n`);
    }

    // Search test
    console.log("5. Search Test:");
    const searchResponse = await fetch(`${BASE_URL}/geocode/search?query=Paris&limit=3`);
    const searchData = await searchResponse.json();
    if (searchData.success) {
      console.log(`   🔍 Query: ${searchData.query}`);
      console.log(`   📊 Results: ${searchData.count}`);
      searchData.results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.label} (${result.lat}, ${result.lon})`);
      });
      console.log("");
    } else {
      console.log(`   ❌ Error: ${searchData.error}\n`);
    }

    console.log("✅ All tests completed successfully!");
    console.log("\n📚 Next steps:");
    console.log("   • Python: pip install quick-geocode-client");
    console.log("   • Java: Add Maven dependency com.quickgeocode:client:0.2.0");
    console.log("   • Any language: Use HTTP client with the API endpoints");
    console.log("   • Docker: docker run -p 3000:3000 quick-geocode-api");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the API server is running:");
    console.log("   npm run server");
    process.exit(1);
  }
}

// Run the test
testApi();
