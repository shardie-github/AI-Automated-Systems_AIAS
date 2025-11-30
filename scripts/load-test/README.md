# Load Testing Infrastructure

This directory contains tools for scalability stress testing to simulate 10x peak user load.

## Usage

### Run Load Test

```bash
# Basic usage (default: 1000 users, 5 minutes)
pnpm tsx scripts/load-test/stress-test.ts

# Custom configuration
pnpm tsx scripts/load-test/stress-test.ts \
  --users 2000 \
  --duration 600 \
  --ramp-up 120 \
  --base-url https://api.example.com
```

### Environment Variables

- `BASE_URL`: Base URL for the API (default: http://localhost:3000)
- `TARGET_USERS`: Number of concurrent users (default: 1000)
- `DURATION`: Test duration in seconds (default: 300)
- `RAMP_UP_TIME`: Ramp up time in seconds (default: 60)

### Generate HTML Report

```bash
pnpm tsx scripts/load-test/generate-report.ts
```

## Test Configuration

The load test simulates realistic user behavior by:

1. **Ramping up users gradually** to avoid sudden spikes
2. **Weighted endpoint selection** based on real usage patterns
3. **Random delays** between requests (100ms - 2s)
4. **Tracking comprehensive metrics**:
   - Response times (avg, p50, p95, p99)
   - Error rates
   - Requests per second
   - Status code distribution
   - Per-endpoint statistics

## Metrics Tracked

- **Latency**: Average, P50, P95, P99 response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Resource Consumption**: CPU, memory, network (if available)
- **Cost per User**: Estimated infrastructure cost per user

## Reports

Test results are saved to `reports/load-test-{timestamp}.json` and can be converted to HTML for detailed analysis.

## Integration with CI/CD

Add to `.github/workflows/`:

```yaml
- name: Run Load Test
  run: |
    pnpm tsx scripts/load-test/stress-test.ts --users 1000 --duration 300
  env:
    BASE_URL: ${{ secrets.TEST_BASE_URL }}
```

## Target Metrics

For 10x peak load (assuming 100 peak users → 1000 concurrent):

- **P95 Latency**: < 2s
- **P99 Latency**: < 3s
- **Error Rate**: < 1%
- **Requests/Second**: > 100 RPS
- **Availability**: > 99.9%
