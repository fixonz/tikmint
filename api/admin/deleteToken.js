import { promises as fs } from 'fs';
import path from 'path';

// File path for storing tokens
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'tokens.json');

// Read tokens from file
async function readTokens() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid JSON, return empty array
    return [];
  }
}

// Write tokens to file
async function writeTokens(tokens) {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing tokens file:', error);
    throw new Error('Failed to save token data');
  }
}

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

  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { ca } = req.query;
    
    // Validate required fields
    if (!ca) {
      res.status(400).json({ error: 'Missing contract address parameter' });
      return;
    }

    // Read existing tokens
    const tokens = await readTokens();
    
    // Check if token exists
    const tokenIndex = tokens.findIndex(token => token.ca === ca);
    if (tokenIndex === -1) {
      res.status(404).json({ error: 'Token not found' });
      return;
    }
    
    // Remove the token
    tokens.splice(tokenIndex, 1);
    
    // Save updated tokens
    await writeTokens(tokens);

    res.status(200).json({ success: true, message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ error: 'Failed to delete token' });
  }
} 