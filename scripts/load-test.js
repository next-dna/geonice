#!/usr/bin/env node

/**
 * Load testing script for quick-geocode API
 * Tests performance under high load
 */

const http = require('http');
const { performance } = require('perf_hooks');

const CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000',
  CONCURRENT_USERS: parseInt(process.env.CONCURRENT_USERS) || 100,
  REQUESTS_PER_USER: parseInt(process.env.REQUESTS_PER_USER) || 10,
  TEST_DURATION: parseInt(process.env.TEST_DURATION) || 60, // seconds
};

const TEST_QUERIES = [
  'Sydney, Australia',
  'New York, USA',
  'London, UK',
  'Paris, France',
  'Tokyo, Japan',
  'Berlin, Germany',
  'Madrid, Spain',
  'Rome, Italy',
  'Amsterdam, Netherlands',
  'Vienna, Austria'
];

class LoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  async makeRequest(query) {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const url = new URL('/geocode', CONFIG.BASE_URL);
      url.searchParams.set('query', query);
      
      const req = http.get(url.toString(), (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.results.totalRequests++;
          this.results.responseTimes.push(responseTime);
          
          if (res.statusCode === 200) {
            this.results.successfulRequests++;
          } else {
            this.results.failedRequests++;
            this.results.errors.push({
              statusCode: res.statusCode,
              query,
              responseTime
            });
          }
          
          resolve({ statusCode: res.statusCode, responseTime, data });
        });
      });
      
      req.on('error', (err) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          error: err.message,
          query,
          responseTime
        });
        
        resolve({ error: err.message, responseTime });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        this.results.failedRequests++;
        this.results.errors.push({
          error: 'Timeout',
          query,
          responseTime: 10000
        });
        resolve({ error: 'Timeout' });
      });
    });
  }

  async runUser(userId) {
    const requests = [];
    
    for (let i = 0; i < CONFIG.REQUESTS_PER_USER; i++) {
      const query = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
      requests.push(this.makeRequest(query));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
    
    return Promise.all(requests);
  }

  async runLoadTest() {
    console.log(`🚀 Starting load test with ${CONFIG.CONCURRENT_USERS} concurrent users`);
    console.log(`📊 Each user will make ${CONFIG.REQUESTS_PER_USER} requests`);
    console.log(`⏱️  Test duration: ${CONFIG.TEST_DURATION} seconds`);
    console.log(`🌐 Target: ${CONFIG.BASE_URL}\n`);

    this.results.startTime = performance.now();
    
    // Create concurrent users
    const userPromises = [];
    for (let i = 0; i < CONFIG.CONCURRENT_USERS; i++) {
      userPromises.push(this.runUser(i));
    }
    
    // Run test for specified duration
    const testPromise = Promise.all(userPromises);
    const timeoutPromise = new Promise(resolve => 
      setTimeout(resolve, CONFIG.TEST_DURATION * 1000)
    );
    
    await Promise.race([testPromise, timeoutPromise]);
    
    this.results.endTime = performance.now();
    this.printResults();
  }

  printResults() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const rps = this.results.totalRequests / duration;
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    
    // Calculate response time statistics
    const responseTimes = this.results.responseTimes.sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
    
    console.log('\n📊 LOAD TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`📈 Total Requests: ${this.results.totalRequests}`);
    console.log(`✅ Successful: ${this.results.successfulRequests} (${successRate.toFixed(2)}%)`);
    console.log(`❌ Failed: ${this.results.failedRequests}`);
    console.log(`🚀 Requests/sec: ${rps.toFixed(2)}`);
    console.log(`📊 Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`📊 P50 Response Time: ${p50.toFixed(2)}ms`);
    console.log(`📊 P95 Response Time: ${p95.toFixed(2)}ms`);
    console.log(`📊 P99 Response Time: ${p99.toFixed(2)}ms`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      const errorTypes = {};
      this.results.errors.forEach(err => {
        const key = err.error || err.statusCode;
        errorTypes[key] = (errorTypes[key] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} occurrences`);
      });
    }
    
    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT:');
    if (rps >= 1000 && successRate >= 99 && p95 <= 1000) {
      console.log('🟢 EXCELLENT - Ready for 100k+ users');
    } else if (rps >= 500 && successRate >= 95 && p95 <= 2000) {
      console.log('🟡 GOOD - Suitable for moderate load');
    } else {
      console.log('🔴 NEEDS IMPROVEMENT - Not ready for high load');
    }
  }
}

// Run the load test
const tester = new LoadTester();
tester.runLoadTest().catch(console.error);
