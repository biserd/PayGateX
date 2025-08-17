# 🔐 Base Sepolia Wallet Testing Setup

## Step 1: Setup Your Wallet

### Add Base Sepolia Network to MetaMask
1. Open MetaMask and click "Add Network"
2. Enter these details:
   - **Network Name**: Base Sepolia
   - **RPC URL**: https://sepolia.base.org
   - **Chain ID**: 84532
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://sepolia.basescan.org

### Get Test Assets
1. **Get Base Sepolia ETH**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Connect your wallet
   - Claim test ETH for gas fees
2. **Get Base Sepolia USDC**: 
   - Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
   - Use faucets or bridge small amounts

## Step 2: Configure PayGate for Testing

### Enable Sandbox Mode (Base Sepolia)
Visit: http://localhost:5000/settings → Organization tab → Enable "Sandbox Mode"

This switches the platform to use Base Sepolia testnet instead of Base mainnet.

## Step 3: Your Wallet Address Configuration

### WHERE TO PUT YOUR WALLET ADDRESS:

1. **In the Wallet Test Page**: 
   - Navigate to: http://localhost:5000/wallet-test
   - Enter your wallet address in the "Your Wallet Address" field
   - This identifies YOU as the payer

2. **In API Headers** (for direct testing):
   ```bash
   curl "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats" \
     -H "X-Payer-Address: YOUR_WALLET_ADDRESS_HERE"
   ```

### Important: Two Different Addresses

- **Your Wallet (Payer)**: This is YOUR address that sends USDC
- **Organization Wallet (Payee)**: This receives the USDC payments
  - Currently set to: `demo-org-1` (configured in database)
  - In production, organizations set their own receiving addresses

## Step 4: Complete Test Flow

1. **Get Payment Quote**:
   ```bash
   curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats"
   ```
   
2. **Send USDC Payment**:
   - From: YOUR wallet address  
   - To: Organization's payTo address (from quote)
   - Amount: Convert from quote (e.g., "500" = 0.0005 USDC)
   - Network: Base Sepolia

3. **Test API Access**:
   ```bash
   curl "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats" \
     -H "X-Payment: YOUR_TRANSACTION_HASH" \
     -H "X-Payer-Address: YOUR_WALLET_ADDRESS"
   ```

## Example Test Session

```bash
# 1. Enable sandbox mode
curl -X PUT "http://localhost:5000/api/organization/sandbox" \
  -H "Content-Type: application/json" \
  -d '{"sandboxMode": true}'

# 2. Get quote - shows Base Sepolia network
curl -s "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats"

# 3. After sending USDC, test with your details:
curl "http://localhost:5000/proxy/demo-org/demo-service/api/v1/cats" \
  -H "X-Payment: 0xYOUR_TX_HASH_FROM_BASE_SEPOLIA" \
  -H "X-Payer-Address: 0xYOUR_WALLET_ADDRESS"
```

## Wallet Test Page Features

The new Wallet Test page (http://localhost:5000/wallet-test) provides:

- ✅ **Network Configuration**: Shows current Base Sepolia settings
- ✅ **Payment Quote Generator**: Get quotes for different endpoints  
- ✅ **Wallet Address Input**: Enter YOUR paying wallet address
- ✅ **Transaction Testing**: Test API access with your tx hash
- ✅ **Base Sepolia Links**: Direct links to explorer and faucets

## Network Information

- **Sandbox (Base Sepolia)**:
  - Chain ID: 84532
  - USDC Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  - Explorer: https://sepolia.basescan.org

- **Production (Base Mainnet)**:  
  - Chain ID: 8453
  - USDC Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  - Explorer: https://basescan.org
