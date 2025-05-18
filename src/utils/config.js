// Configuration for the TikMint application

// Solana RPC Endpoint Configuration
// For production, replace with a private RPC provider that allows browser access
// Examples: 
// - QuickNode: https://YOUR_API_KEY.solana-mainnet.quiknode.pro/
// - Alchemy: https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
// - Helius: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

export const SOLANA_RPC_ENDPOINT = {
  MAINNET: "https://api.mainnet-beta.solana.com", // Public endpoint - may have rate limits and block browser access
  DEVNET: "https://api.devnet.solana.com",
  TESTNET: "https://api.testnet.solana.com",
  
  // Use this for production - replace with your own endpoint
  CUSTOM: "https://solana-mainnet.g.alchemy.com/v2/your-api-key-here"
};

// The active RPC endpoint to use
export const ACTIVE_RPC_ENDPOINT = SOLANA_RPC_ENDPOINT.DEVNET;

// Token launch configuration
export const TOKEN_LAUNCH_CONFIG = {
  // Amount of SOL to purchase after launch
  PURCHASE_AMOUNT: 0.001,
  
  // Compute budget for launch transaction
  COMPUTE_UNITS: 1400000
}; 