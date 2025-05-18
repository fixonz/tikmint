import { 
    Keypair, 
    Connection, 
    PublicKey, 
    Transaction, 
    TransactionInstruction, 
    ComputeBudgetProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
    PUMP_FUN_PROGRAM, 
    PUMP_FUN_ACCOUNT, 
    GLOBAL, 
    SYSTEM_PROGRAM, 
    RENT, 
    MPL_TOKEN_METADATA, 
    MINT_AUTHORITY,
    COMPUTE_BUDGET_PROGRAM_ID
} from './constants';
import { 
    getKeyPairFromPrivateKey, 
    createTransaction, 
    sendAndConfirmTransactionWrapper, 
    bufferFromString, 
    bufferFromUInt64 
} from './utils';
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    createTransferInstruction,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Use the provided Helius RPC endpoint with API key
const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=3aee6690-51f7-414a-92a0-e4899ce45047";

/**
 * Creates a token on Pump.fun
 * @param {string} privateKey - The private key of the token creator
 * @param {string} tokenName - The name of the token
 * @param {string} tokenSymbol - The symbol for the token
 * @param {string} description - Token description
 * @param {string} tokenImage - Base64 encoded image data
 * @returns {Promise<{success: boolean, tokenAddress: string | null, error: string | null}>}
 */
export async function launchPumpFunToken(privateKey, tokenName, tokenSymbol, description = "Launched on TikMint", tokenImage = null) {
    try {
        if (!tokenImage) {
            return {
                success: false,
                tokenAddress: null,
                error: "Token image is required"
            };
        }

        // Generate a random keypair for the token mint
        const mintKeypair = Keypair.generate();
        console.log("Generated token address:", mintKeypair.publicKey.toString());
        
        // Upload image and metadata to IPFS via Pump.fun
        console.log("Uploading metadata and image to IPFS...");
        const metadataResponse = await fetch("/api/pumpfun/ipfs", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: tokenName,
                symbol: tokenSymbol,
                description: description,
                showName: 'true',
                file: tokenImage
            })
        });
        
        if (!metadataResponse.ok) {
            throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
        }
        
        const metadataResult = await metadataResponse.json();
        console.log("Metadata uploaded successfully:", metadataResult);
        
        // Prepare token metadata for creation
        const tokenMetadata = {
            name: tokenName,
            symbol: tokenSymbol,
            uri: metadataResult.metadataUri
        };
        
        // Get wallet keypair from private key
        const wallet = await getKeyPairFromPrivateKey(privateKey);
        
        console.log("Preparing to create token with public key:", wallet.publicKey.toString());
        
        // Determine if we should use the local or remote API based on environment
        const isProd = process.env.NODE_ENV === 'production';
        let tokenAddress = null;
        
        if (isProd) {
            // Use API key-based approach for production
            tokenAddress = await createTokenRemote(wallet, mintKeypair, tokenMetadata);
        } else {
            // Use local signing for development
            tokenAddress = await createTokenLocal(wallet, mintKeypair, tokenMetadata);
        }
        
        // Add token to website
        await addTokenToWebsite(tokenName, tokenSymbol, tokenAddress, tokenImage);
        
        return {
            success: true,
            tokenAddress,
            error: null
        };
    } catch (error) {
        console.error("Error launching token:", error);
        return {
            success: false,
            tokenAddress: null,
            error: error.message
        };
    }
}

/**
 * Creates a token using the remote API (needs API key)
 * @param {Keypair} wallet - Wallet keypair
 * @param {Keypair} mintKeypair - Token mint keypair
 * @param {Object} tokenMetadata - Token metadata
 * @returns {Promise<string>} - Token address
 */
async function createTokenRemote(wallet, mintKeypair, tokenMetadata) {
    // For demo purposes, we'll use local API approach instead of exposing API key
    return await createTokenLocal(wallet, mintKeypair, tokenMetadata);
    
    // Example of how you would implement server-side token creation
    /*
    const response = await fetch("/api/pumpfun/create", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey: wallet.publicKey.toString(),
            tokenName: tokenMetadata.name,
            tokenSymbol: tokenMetadata.symbol,
            description: "Launched on TikMint",
            mintPublicKey: mintKeypair.publicKey.toString(),
            mintPrivateKey: Array.from(mintKeypair.secretKey)
        })
    });
    
    if (!response.ok) {
        throw new Error(`Failed to create token: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Token created with API:", result);
    
    return mintKeypair.publicKey.toString();
    */
}

/**
 * Creates a token using local transaction signing
 * @param {Keypair} wallet - Wallet keypair
 * @param {Keypair} mintKeypair - Token mint keypair
 * @param {Object} tokenMetadata - Token metadata
 * @returns {Promise<string>} - Token address
 */
async function createTokenLocal(wallet, mintKeypair, tokenMetadata) {
    console.log("Creating token using local transaction signing...");
    
    // Generate the token creation transaction
    const response = await fetch("https://pumpportal.fun/api/trade-local", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey: wallet.publicKey.toString(),
            action: 'create',
            tokenMetadata: tokenMetadata,
            mint: mintKeypair.publicKey.toString(),
            denominatedInSol: 'true',
            amount: 0.001, // Fixed purchase of 0.001 SOL worth
            slippage: 10,
            priorityFee: 0.0001,
            pool: 'pump'
        })
    });
    
    if (!response.ok) {
        throw new Error(`Failed to generate transaction: ${response.statusText}`);
    }
    
    // Get the transaction data
    const responseData = await response.arrayBuffer();
    const transactionData = new Uint8Array(responseData);
    
    // Import required functions from @solana/web3.js
    const { VersionedTransaction } = await import('@solana/web3.js');
    
    // Deserialize the transaction
    const transaction = VersionedTransaction.deserialize(transactionData);
    
    // Sign the transaction with both the wallet and mint keypairs
    transaction.sign([mintKeypair, wallet]);
    
    // Serialize the signed transaction
    const serializedTransaction = transaction.serialize();
    
    // Send the transaction to Solana using our custom RPC
    const sendResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sendTransaction',
            params: [
                Buffer.from(serializedTransaction).toString('base64'),
                { encoding: 'base64', preflightCommitment: 'confirmed' }
            ]
        })
    });
    
    const sendResult = await sendResponse.json();
    
    if (sendResult.error) {
        throw new Error(`Failed to send transaction: ${JSON.stringify(sendResult.error)}`);
    }
    
    console.log("Token created with transaction:", sendResult.result);
    
    return mintKeypair.publicKey.toString();
}

/**
 * Adds the token to the website's token list via API
 * @param {string} name - Token name
 * @param {string} ticker - Token ticker/symbol
 * @param {string} ca - Contract address
 * @param {string} image - Token image (base64)
 * @returns {Promise<void>}
 */
async function addTokenToWebsite(name, ticker, ca, image = null) {
    try {
        const response = await fetch('/api/admin/addToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                ticker,
                ca,
                time: new Date().toLocaleString(),
                description: "Launched on TikMint",
                image
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to add token to website: ${response.statusText}`);
        }
        
        console.log("Token added to website successfully");
    } catch (error) {
        console.error("Error adding token to website:", error);
        // We don't throw here, as the token was still created
    }
} 