import { promises as fs } from 'fs';
import path from 'path';

// File path for storing tokens
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'tokens.json');

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    return true;
  } catch (error) {
    console.error('Error creating data directory:', error);
    return false;
  }
}

// Read tokens from file
async function readTokens() {
  try {
    const dirCreated = await ensureDataDir();
    if (!dirCreated) return [];
    
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } catch (fileError) {
      // If file doesn't exist, create an empty one
      if (fileError.code === 'ENOENT') {
        await fs.writeFile(DATA_FILE_PATH, '[]', 'utf8');
        return [];
      }
      throw fileError;
    }
  } catch (error) {
    console.error("Error reading tokens:", error);
    return [];
  }
}

// Write tokens to file
async function writeTokens(tokens) {
  try {
    const dirCreated = await ensureDataDir();
    if (!dirCreated) throw new Error('Could not create data directory');
    
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing tokens file:', error);
    return false;
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, ticker, ca, time, image, description } = req.body;
    
    // Validate required fields
    if (!name || !ticker || !ca) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create token object with link
    const newToken = {
      name,
      ticker: ticker.startsWith('$') ? ticker : `$${ticker}`,
      ca,
      time: time || new Date().toLocaleString(),
      link: `https://solscan.io/token/${ca}`,
      description: description || "Launched on TikMint"
    };

    // Add image if provided
    if (image) {
      newToken.image = image;
    }

    // Read existing tokens
    const tokens = await readTokens();
    
    // Check if token already exists
    const tokenExists = tokens.some(token => token.ca === ca);
    if (tokenExists) {
      // If token exists, update it
      const tokenIndex = tokens.findIndex(token => token.ca === ca);
      tokens[tokenIndex] = { ...tokens[tokenIndex], ...newToken };
    } else {
      // Add new token at the beginning (most recent)
      tokens.unshift(newToken);
    }
    
    // Save updated tokens
    const saved = await writeTokens(tokens);
    if (!saved) {
      throw new Error('Failed to save token data');
    }

    res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    console.error('Error adding token:', error);
    res.status(500).json({ error: 'Failed to add token: ' + error.message });
  }
} 