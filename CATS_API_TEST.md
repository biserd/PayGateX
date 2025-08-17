# Testing Your Cats API with x402 Payment Protocol

## Quick Test Guide for Your Cats API

### Step 1: Get Your Endpoint Details

1. Go to your endpoints page in the dashboard
2. Find your Cats API endpoint 
3. Note the organization ID and service ID from the URL or interface

### Step 2: Test Unpaid Request (Should Return HTTP 402)

First, check what endpoints you actually created. Based on the seeded data, try these:

```bash
# Test the seeded AI endpoint (GET method - note: was configured as GET, not POST!)
curl -v "http://localhost:5000/proxy/demo-org-1/demo-service-1/ai/chat"

# Test the seeded analytics endpoint  
curl -v "http://localhost:5000/proxy/demo-org-1/demo-service-1/data/analytics"

# Test your Cats endpoint (created via the dashboard)
curl -v "http://localhost:5000/proxy/demo-org-1/demo-service-1/api/v1/cats"
```

**IMPORTANT**: The HTTP method must match exactly what you configured when creating the endpoint!

**Important**: 
- The path must exactly match what you configured in the endpoint creation form!
- The HTTP method must match exactly (GET vs POST)
- If you get a mock response instead of HTTP 402, the free tier is still active

**Expected HTTP 402 Response:**
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base", 
    "maxAmountRequired": "500",
    "resource": "/demo-org-1/demo-service-1/api/v1/cats",
    "description": "API access",
    "payTo": "demo-org-1",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }]
}
```

**Expected Result**: HTTP 402 Payment Required with payment quote

### Step 2: Get Your Endpoint Details

Check your endpoint configuration in the dashboard or via API:
```bash
curl -s "http://localhost:5000/api/endpoints" | jq '.'
```

### Step 3: Test the 402 Payment Flow

1. **Make the unpaid request** and note the quote ID from the response
2. **Simulate payment** (for development testing):
```bash
curl -X POST "http://localhost:5000/api/payments/simulate" \
-H "Content-Type: application/json" \
-d '{
  "quoteId": "[quote-id-from-402-response]",
  "payerAddress": "0x1234567890123456789012345678901234567890",
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}'
```

3. **Make paid request** with payment proof:
```bash
curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/cats" \
-H "x402-payment-hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
```

**Expected Result**: HTTP 200 with actual cat data from the API

### Step 4: Verify Analytics

1. Go to your dashboard
2. Check that metrics updated:
   - Total requests increased
   - Paid requests increased 
   - Revenue shows the price you set

## Common Cats API Endpoints to Test

If you're using a public cats API, try these variations:

```bash
# Random cat fact
curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/fact"

# Random cat image
curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/image"

# Cat breeds
curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/breeds"
```

## Troubleshooting

- **404 Error**: Check your endpoint path configuration
- **502 Bad Gateway**: Verify your target URL is correct and accessible
- **No 402 Response**: Ensure pricing is configured and endpoint is active
- **Payment Not Accepted**: Check transaction hash format and payment simulation

## Expected Flow Summary

1. **First Request** → HTTP 402 with payment quote
2. **Payment Simulation** → Success confirmation  
3. **Second Request with Payment** → HTTP 200 with cat data
4. **Dashboard Analytics** → Updated metrics

Your Cats API is now monetized with automated micropayments!