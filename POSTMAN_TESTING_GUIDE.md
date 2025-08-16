# Testing PayGate x402 with Postman

## Complete Postman Testing Guide for Your Cats API

### Setup Postman Collection

1. **Create New Collection**: "PayGate x402 Testing"
2. **Set Collection Variables**:
   - `base_url`: `http://localhost:5000`
   - `org_id`: `demo-org` (or your actual org ID)
   - `service_id`: `demo-service` (or your actual service ID)
   - `endpoint_path`: Your endpoint path (e.g., `cats`, `fact`, etc.)

### Test 1: Unpaid Request (Should Get HTTP 402)

**Request Setup:**
- **Method**: GET (or your endpoint's method)
- **URL**: `{{base_url}}/proxy/{{org_id}}/{{service_id}}/{{endpoint_path}}`
- **Headers**: None needed for first test

**Expected Response:**
- **Status**: 402 Payment Required
- **Body**: JSON with payment quote including:
  ```json
  {
    "error": "Payment Required",
    "quote": {
      "id": "quote_abc123",
      "price": "0.10",
      "currency": "USDC",
      "networks": ["base"],
      "expires": "2025-01-16T12:00:00Z",
      "signature": "0x..."
    }
  }
  ```

**Postman Test Script:**
```javascript
pm.test("Status is 402", function () {
    pm.response.to.have.status(402);
});

pm.test("Response has quote", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('quote');
    pm.expect(jsonData.quote).to.have.property('id');
    
    // Save quote ID for next request
    pm.collectionVariables.set("quote_id", jsonData.quote.id);
});
```

### Test 2: Simulate Payment (Development Only)

**Request Setup:**
- **Method**: POST
- **URL**: `{{base_url}}/api/payments/simulate`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "quoteId": "{{quote_id}}",
  "payerAddress": "0x1234567890123456789012345678901234567890",
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Expected Response:**
- **Status**: 200 OK
- **Body**: Success confirmation

**Postman Test Script:**
```javascript
pm.test("Payment simulation successful", function () {
    pm.response.to.have.status(200);
});

// Save transaction hash for paid request
pm.collectionVariables.set("tx_hash", "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
```

### Test 3: Paid Request (Should Get Actual Data)

**Request Setup:**
- **Method**: GET (same as Test 1)
- **URL**: `{{base_url}}/proxy/{{org_id}}/{{service_id}}/{{endpoint_path}}`
- **Headers**:
  - `x402-payment-hash`: `{{tx_hash}}`

**Expected Response:**
- **Status**: 200 OK
- **Body**: Actual data from your Cats API

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains data", function () {
    pm.response.to.not.be.empty;
    // Add specific tests based on your API response
});
```

### Test 4: Analytics Verification

**Request Setup:**
- **Method**: GET
- **URL**: `{{base_url}}/api/dashboard/summary`
- **Headers**: 
  - Authentication cookie (login first)

**Expected Response:**
- Updated metrics showing increased requests and revenue

## Advanced Postman Features

### Environment Variables

Create environments for different testing scenarios:

**Development Environment:**
- `base_url`: `http://localhost:5000`
- `payment_network`: `base`
- `test_price`: `0.10`

**Production Environment:**
- `base_url`: `https://your-domain.com`
- `payment_network`: `ethereum`
- `test_price`: `0.05`

### Pre-request Scripts

Add to collection or request level:

```javascript
// Generate unique transaction hash for testing
const txHash = "0x" + Math.random().toString(16).substr(2, 64);
pm.collectionVariables.set("unique_tx_hash", txHash);

// Add timestamp for unique requests
pm.collectionVariables.set("timestamp", Date.now());
```

### Collection Runner

1. **Setup Runner**: Collection → Run
2. **Test Sequence**:
   - Test 1: Unpaid Request
   - Test 2: Simulate Payment  
   - Test 3: Paid Request
   - Test 4: Analytics Check
3. **Iterations**: Set to 3-5 to test multiple payments
4. **Delay**: 1000ms between requests

### Mock Server Testing

If you want to test without running the full application:

1. **Create Mock Server** in Postman
2. **Add Mock Responses**:
   - 402 responses with sample quotes
   - 200 responses with sample data
3. **Test Client Logic** against predictable responses

## Common API Endpoints to Test

### Popular Cat APIs

**Cat Facts API:**
- URL pattern: `/proxy/{{org_id}}/{{service_id}}/fact`
- Expected: Random cat fact JSON

**Cat Images API:**
- URL pattern: `/proxy/{{org_id}}/{{service_id}}/image` 
- Expected: Image URL or binary data

**Cat Breeds API:**
- URL pattern: `/proxy/{{org_id}}/{{service_id}}/breeds`
- Expected: Array of cat breed information

### Test Different HTTP Methods

Create separate requests for:
- **GET**: Retrieve data
- **POST**: Submit data (if your API accepts it)
- **PUT**: Update data
- **DELETE**: Remove data

## Troubleshooting with Postman

### Common Issues

**1. 404 Not Found**
- Check endpoint path in URL
- Verify organization and service IDs
- Ensure endpoint is active in dashboard

**2. 500 Internal Server Error**
- Check target API URL is valid
- Verify your API endpoint configuration
- Look at Postman console for detailed errors

**3. Payment Not Accepted**
- Ensure transaction hash format is correct (0x + 64 hex chars)
- Check quote hasn't expired
- Verify payment simulation was successful

### Debug Features

1. **Postman Console**: View detailed request/response logs
2. **Network Tab**: Check actual HTTP traffic  
3. **Variables Tab**: Verify all variables are set correctly
4. **Tests Tab**: See which assertions pass/fail

## Export and Share

### Collection Export
1. Collection → Export
2. Choose Collection v2.1
3. Share with team members

### Environment Export  
1. Environment → Export
2. Include in project repository
3. Document setup instructions

## Integration with CI/CD

Use Newman (Postman CLI) for automated testing:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run PayGate_x402_Testing.postman_collection.json \
  -e Development.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

## Security Notes

- Never commit real API keys or payment credentials
- Use environment variables for sensitive data
- Test with development/sandbox endpoints first
- Rotate test transaction hashes regularly

Your Cats API is now fully testable with Postman's powerful features!