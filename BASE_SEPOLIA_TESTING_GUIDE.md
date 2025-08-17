# Base Sepolia Testing Guide

## Prerequisites

### 1. Wallet Setup
- **MetaMask or Compatible Wallet**: Install and set up
- **Base Sepolia Network**: Add to your wallet
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency Symbol: ETH
  - Block Explorer: https://sepolia.basescan.org

### 2. Get Test Assets
- **ETH for Gas**: Get Base Sepolia ETH from faucet
  - Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
  - Connect wallet and claim test ETH
- **Test USDC**: Get Base Sepolia USDC
  - Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  - Use Base Sepolia faucets or bridge small amounts

## Testing with PayGate x402

### 1. Enable Sandbox Mode
```bash
# Ensure sandbox mode is enabled (Base Sepolia)
curl -X PUT "http://localhost:5000/api/organization/sandbox" \
  -H "Content-Type: application/json" \
  -d '{"sandboxMode": true}'
```

### 2. Get Payment Quote
```bash
# Request x402 quote for Base Sepolia
curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats"
```

### 3. Make USDC Payment
Using your wallet:
1. **Recipient**: Use the `payTo` address from the quote
2. **Amount**: Convert from the quote (e.g., "500" = 0.0005 USDC)
3. **Network**: Base Sepolia (Chain ID: 84532)
4. **Token**: USDC (0x036CbD53842c5426634e7929541eC2318f3dCF7e)

### 4. Test API with Payment Proof
```bash
# Use the transaction hash from your USDC transfer
curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats" \
  -H "X-Payment: YOUR_TX_HASH" \
  -H "X-Payer-Address: YOUR_WALLET_ADDRESS"
```

## Wallet Address Configuration

### For Organizations
The organization's wallet address is configured in the database as the `payTo` field. This is where USDC payments are sent.

### For Users (Payers)
Users provide their wallet address in the `X-Payer-Address` header when making payments. This identifies who made the payment.

## Example Test Flow

1. **Get Quote**: Request shows Base Sepolia network and USDC amount
2. **Send USDC**: Transfer required amount to organization's address
3. **Get Transaction Hash**: Copy from wallet or block explorer
4. **Test Access**: Use transaction hash to access protected API
5. **Verify**: Check Base Sepolia block explorer for transaction

## Network Configuration

- **Sandbox Mode**: Base Sepolia (testnet)
  - Safe for testing with small amounts
  - Same interface as mainnet
  - No real financial risk

- **Production Mode**: Base Mainnet
  - Real USDC transactions
  - Actual financial value
  - Production-ready payments