// Sample data - static version of what was in the backend
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

// This is a Vercel serverless function
export default function handler(req, res) {
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

  try {
    // In a real implementation, you would fetch data from Solana here
    // For now, we'll just return the sample data
    res.status(200).json(sampleLaunches);
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).json({ error: 'Failed to fetch launches' });
  }
} 