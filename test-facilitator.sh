#!/bin/bash

echo "Testing Mock Facilitator (should show [MOCK-FACILITATOR] logs):"
curl -s -X POST "http://localhost:5000/api/test-facilitator" \
  -H "Content-Type: application/json" \
  -d '{"action": "verify"}' | jq .

echo -e "\nTesting Coinbase Facilitator (should show [COINBASE-FACILITATOR] logs):"
curl -s -X POST "http://localhost:5000/api/test-facilitator" \
  -H "Content-Type: application/json" \
  -d '{"action": "verify", "facilitatorType": "coinbase"}' | jq .

echo -e "\nTesting Quote Generation (should show quote creation logs):"
curl -s -X POST "http://localhost:5000/api/test-facilitator" \
  -H "Content-Type: application/json" \
  -d '{"action": "quote", "facilitatorType": "coinbase"}' | jq .