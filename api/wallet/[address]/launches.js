import { promises as fs } from 'fs';
import path from 'path';

// File path for storing tokens
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'tokens.json');

// Sample data as fallback
const sampleLaunches = [
  { 
    name: 'Toast', 
    ticker: '$TOAST', 
    ca: 'ALcYrZ4A41JUoDGKCbhUkjkcUiRjs2sbrUhmTJXMpump', 
    time: new Date().toLocaleString(), 
    link: 'https://solscan.io/token/ALcYrZ4A41JUoDGKCbhUkjkcUiRjs2sbrUhmTJXMpump', 
    image: 'https://pump.mypinata.cloud/ipfs/QmPD26y6wXQwA4itfz9FTVsxGGxbaGPVPjDnvCXsR7ZHsu?img-width=256&img-dpr=2&img-onerror=redirect' 
  }
];

// The deployer wallet to track
const DEPLOYER_WALLET = "MiNT5ERW9ResSsKRmeg4b29XPj5LDvW7MoBCrNmdiPL";

// Read tokens from file
async function readTokens() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Error reading tokens file, using sample data:', error.message);
    // If file doesn't exist or is invalid, return the sample data
    return sampleLaunches;
  }
}

// This is a Vercel serverless function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get the wallet address from the URL
  const { address } = req.query;

  // Log for debugging
  console.log(`Fetching launches for wallet: ${address}`);

  try {
    // Read all tokens
    const allTokens = await readTokens();
    
    // Return all tokens if the address matches our target wallet
    if (address === DEPLOYER_WALLET) {
      res.status(200).json(allTokens);
    } else {
      // For demo purposes, return empty array for other wallets
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).json({ error: `Failed to fetch launches for wallet: ${address}` });
  }
} 