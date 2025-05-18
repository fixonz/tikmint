import { 
    Keypair, 
    Connection, 
    PublicKey, 
    Transaction, 
    TransactionInstruction, 
    ComputeBudgetProgram
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

/**
 * Creates a token on Pump.fun
 * @param {string} privateKey - The private key of the token creator
 * @param {string} tokenName - The name of the token
 * @param {string} tokenSymbol - The symbol for the token
 * @returns {Promise<{success: boolean, tokenAddress: string | null, error: string | null}>}
 */
export async function launchPumpFunToken(privateKey, tokenName, tokenSymbol) {
    try {
        // Initialize connection to Solana
        const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
        
        // Get keypair from private key
        const wallet = await getKeyPairFromPrivateKey(privateKey);
        
        // Create the launch instruction
        const launchInstruction = await createLaunchInstruction(
            connection,
            wallet.publicKey,
            tokenName,
            tokenSymbol
        );
        
        // Create the transaction
        const transaction = await createTransaction(
            connection,
            [
                ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
                launchInstruction
            ],
            wallet.publicKey
        );
        
        // Sign and send the transaction
        const signature = await sendAndConfirmTransactionWrapper(
            connection,
            transaction,
            [wallet]
        );
        
        if (!signature) {
            return {
                success: false,
                tokenAddress: null,
                error: "Failed to send transaction"
            };
        }
        
        // Wait for transaction confirmation and get token address
        const tokenAddress = await getTokenAddressFromSignature(connection, signature);
        
        // Add token to the website list
        const addedToWebsite = await addTokenToWebsite(tokenName, tokenSymbol, tokenAddress);
        
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
 * Creates a launch instruction for PumpFun token
 * @param {Connection} connection - Solana connection
 * @param {PublicKey} walletPublicKey - Wallet public key
 * @param {string} tokenName - The name of the token
 * @param {string} tokenSymbol - The symbol for the token
 * @returns {Promise<TransactionInstruction>}
 */
async function createLaunchInstruction(connection, walletPublicKey, tokenName, tokenSymbol) {
    // Set up accounts
    const accounts = [
        { pubkey: walletPublicKey, isSigner: true, isWritable: true },
        { pubkey: GLOBAL, isSigner: false, isWritable: true },
        { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: true },
        { pubkey: MPL_TOKEN_METADATA, isSigner: false, isWritable: false },
        { pubkey: MINT_AUTHORITY, isSigner: false, isWritable: false },
        { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: RENT, isSigner: false, isWritable: false }
    ];
    
    // Create data buffer for instruction
    const nameBuffer = bufferFromString(tokenName);
    const symbolBuffer = bufferFromString(tokenSymbol);
    
    // Set command code for creating token (0 = create token)
    const commandBuffer = Buffer.from([0]);
    
    // Combine data
    const data = Buffer.concat([
        commandBuffer,
        nameBuffer,
        symbolBuffer
    ]);
    
    // Create and return the instruction
    return new TransactionInstruction({
        keys: accounts,
        programId: PUMP_FUN_PROGRAM,
        data
    });
}

/**
 * Get token address from transaction signature
 * @param {Connection} connection - Solana connection
 * @param {string} signature - Transaction signature
 * @returns {Promise<string>} - Token address
 */
async function getTokenAddressFromSignature(connection, signature) {
    try {
        // Wait for transaction confirmation
        await connection.confirmTransaction(signature);
        
        // Get transaction details
        const transaction = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
        });
        
        // Extract token address from transaction logs
        if (transaction && transaction.meta && transaction.meta.logMessages) {
            const logs = transaction.meta.logMessages;
            
            // Look for token address in logs
            for (const log of logs) {
                if (log.includes('Created token:')) {
                    const tokenAddress = log.split('Created token:')[1].trim();
                    return tokenAddress;
                }
            }
        }
        
        throw new Error("Could not find token address in transaction logs");
    } catch (error) {
        console.error("Error getting token address from signature:", error);
        throw error;
    }
}

/**
 * Add token to the website's tracked list
 * @param {string} name - Token name
 * @param {string} ticker - Token ticker
 * @param {string} ca - Contract address
 * @returns {Promise<boolean>} - Success status
 */
async function addTokenToWebsite(name, ticker, ca) {
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
                time: new Date().toLocaleString()
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error("Error adding token to website:", error);
        return false;
    }
} 