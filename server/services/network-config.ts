export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  usdcAddress: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  "base": {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  },
  "base-sepolia": {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    usdcAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  }
};

export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Network configuration not found for: ${network}`);
  }
  return config;
}

export function getNetworkForSandbox(sandboxMode: boolean, mainnetNetwork: string = "base"): string {
  if (sandboxMode) {
    // Map mainnet networks to their testnet equivalents
    switch (mainnetNetwork) {
      case "base":
        return "base-sepolia";
      case "ethereum":
        return "ethereum-sepolia";
      default:
        return "base-sepolia";
    }
  }
  return mainnetNetwork;
}

export function isTestnet(network: string): boolean {
  return network.includes("sepolia") || network.includes("testnet") || network.includes("goerli");
}