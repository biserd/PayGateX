# PayGate x402 Testing Guide

## Overview
This guide walks you through testing all features of the PayGate x402 platform, from basic authentication to advanced payment enforcement and analytics.

## Prerequisites
- PayGate x402 application running (npm run dev)
- Access to the web interface
- Basic understanding of API endpoints and HTTP requests

## Step 1: Authentication & Account Setup

### 1.1 Create Account
1. Navigate to the landing page at `http://localhost:5000`
2. Click "Sign In" button in the header
3. On the auth page, switch to "Register" tab
4. Fill in registration form:
   - Username: `testuser`
   - Password: `testpass123`
5. Click "Register" - you should be automatically logged in
6. Verify you're redirected to the dashboard

### 1.2 Explore Dashboard
1. Check the dashboard summary shows initial metrics (likely zeros)
2. Note the organization ID in the URL or interface
3. Familiarize yourself with the sidebar navigation

## Step 2: Configure Your First API Endpoint

### 2.1 Create a Service
1. Navigate to "Endpoints" in the sidebar
2. Click "Add Service" button
3. Fill in service details:
   - Name: `Test Weather API`
   - Description: `Weather data service for testing`
4. Click "Create Service"

### 2.2 Add an Endpoint
1. In the newly created service, click "Add Endpoint"
2. Configure endpoint:
   - Name: `Get Weather`
   - Method: `GET`
   - Path: `/weather`
   - Price: `0.10` (10 cents in USDC)
   - Network: `Base`
   - Origin URL: `https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo`
3. Click "Create Endpoint"

## Step 3: Test Payment Enforcement

### 3.1 Test Unpaid Request
1. Copy the proxy URL for your endpoint (should be something like `http://localhost:5000/proxy/org-id/service-id/weather`)
2. Open a new terminal or use curl:
   ```bash
   curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/weather"
   ```
3. **Expected Result**: HTTP 402 Payment Required response with payment instructions

### 3.2 Verify x402 Response
The response should include:
- Status: 402 Payment Required
- Headers with payment information
- JSON body with quote details including:
  - Price in USDC
  - Payment networks
  - Quote signature
  - Expiry time

## Step 4: Simulate Payment and Test Success

### 4.1 Mock Payment (Development Mode)
1. Note the quote ID from the 402 response
2. Make a payment simulation request:
   ```bash
   curl -X POST "http://localhost:5000/api/payments/simulate" \
   -H "Content-Type: application/json" \
   -d '{
     "quoteId": "[quote-id-from-402-response]",
     "payerAddress": "0x1234567890123456789012345678901234567890",
     "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
   }'
   ```

### 4.2 Test Paid Request
1. Now make the same API request with payment proof:
   ```bash
   curl -v "http://localhost:5000/proxy/[your-org-id]/[your-service-id]/weather" \
   -H "x402-payment-hash: [transaction-hash-from-simulation]"
   ```
2. **Expected Result**: HTTP 200 with actual API response forwarded from the origin

## Step 5: Test Analytics and Monitoring

### 5.1 Check Dashboard Analytics
1. Return to the dashboard
2. Refresh the page to see updated metrics:
   - Total requests should show 2 (one unpaid, one paid)
   - Paid requests should show 1
   - Revenue should show $0.10

### 5.2 Explore Analytics Page
1. Navigate to "Analytics" in sidebar
2. Verify you see:
   - Request volume charts
   - Revenue metrics
   - Conversion rates
   - Usage patterns by endpoint

## Step 6: Test Compliance Controls

### 6.1 Configure Geo-blocking
1. Navigate to "Compliance" page
2. Click "Add Rule"
3. Create a geo-blocking rule:
   - Type: Geographic Restriction
   - Action: Block
   - Countries: Select a test country
4. Save the rule

### 6.2 Test IP Filtering
1. Add another compliance rule:
   - Type: IP Address Filter
   - Action: Block
   - IP Address: `192.168.1.100`
2. Test that requests from this IP are blocked

## Step 7: Test Escrow System

### 7.1 Check Escrow Holdings
1. Navigate to "Escrow" page
2. Verify your test payment appears in pending escrows
3. Note the escrow period (default 7 days)

### 7.2 Simulate Escrow Release
1. In development, you can simulate time passage
2. Use the admin controls to release escrow early for testing

## Step 8: Test User Settings

### 8.1 Update Profile Settings
1. Navigate to "Settings" page
2. Update company information:
   - Company Name: `Test Corp`
   - Website: `https://test.com`
3. Save changes and verify persistence

### 8.2 Configure Notifications
1. In Settings, update notification preferences
2. Test webhook endpoints if configured
3. Verify email notification settings

## Step 9: Advanced Testing Scenarios

### 9.1 Test Free Tier Limits
1. Configure free tier limits on an endpoint
2. Make multiple requests to exceed the limit
3. Verify payment enforcement kicks in after free calls

### 9.2 Test Multiple Networks
1. Create endpoints for different networks (Ethereum, Base)
2. Test payment flows for each network
3. Verify analytics track network-specific metrics

### 9.3 Test Rate Limiting
1. Make rapid successive requests
2. Verify rate limiting is enforced
3. Check error responses are appropriate

## Step 10: Error Handling and Edge Cases

### 10.1 Test Invalid Payments
1. Try requests with invalid payment hashes
2. Try expired quotes
3. Verify appropriate error responses

### 10.2 Test Origin API Failures
1. Configure an endpoint with invalid origin URL
2. Make paid requests and verify error handling
3. Check if payments are refunded for failed origins

## Expected Results Summary

After completing all tests, you should have:

✅ **Authentication**: Successfully created account and logged in
✅ **Endpoint Configuration**: Created service and endpoint with pricing
✅ **Payment Enforcement**: Verified HTTP 402 responses for unpaid requests
✅ **Payment Processing**: Successfully made paid requests after payment
✅ **Analytics**: Saw real-time updates to metrics and charts
✅ **Compliance**: Configured and tested geo-blocking rules
✅ **Escrow**: Verified payment escrow and release mechanisms
✅ **Settings**: Updated and persisted user preferences
✅ **Edge Cases**: Tested error conditions and invalid scenarios

## Troubleshooting Common Issues

### Issue: 402 responses not appearing
- Check endpoint configuration is correct
- Verify proxy URL format
- Ensure service and endpoint are properly created

### Issue: Payments not being accepted
- Verify payment simulation API is working
- Check transaction hash format
- Ensure quote hasn't expired

### Issue: Analytics not updating
- Allow time for data processing
- Refresh browser page
- Check browser console for errors

### Issue: Settings not saving
- Check browser network tab for API errors
- Verify user session is valid
- Try logging out and back in

## Next Steps for Production

1. **Configure Real Payment Networks**: Replace mock payments with actual blockchain networks
2. **Set Up Monitoring**: Configure alerts for system health and payment failures
3. **Scale Testing**: Use load testing tools to verify performance
4. **Security Audit**: Review all endpoints for security vulnerabilities
5. **Documentation**: Create API documentation for your endpoints

## Support

If you encounter issues during testing:
1. Check browser console for JavaScript errors
2. Review server logs for backend errors
3. Verify database connections and schema
4. Test individual API endpoints directly