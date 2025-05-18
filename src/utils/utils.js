import { Keypair, Connection, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { sha256 } from '@noble/hashes/sha256';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function getKeyPairFromPrivateKey(privateKeyString) {
    try {
        // Remove any whitespace
        privateKeyString = privateKeyString.trim();
        
        let secretKey;
        
        // Check if it's a base58 encoded private key
        if (/^[1-9A-HJ-NP-Za-km-z]{88,}$/.test(privateKeyString)) {
            secretKey = bs58.decode(privateKeyString);
        } 
        // Check if it's an array of numbers
        else if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
            secretKey = new Uint8Array(JSON.parse(privateKeyString));
        }
        // Otherwise assume it's a hex string
        else {
            // Remove '0x' prefix if present
            if (privateKeyString.startsWith('0x')) {
                privateKeyString = privateKeyString.slice(2);
            }
            
            // Convert hex to Uint8Array
            secretKey = new Uint8Array(
                privateKeyString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
            );
        }
        
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        throw new Error(`Invalid private key format: ${error.message}`);
    }
}

export async function createTransaction(connection, instructions, payer) {
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return transaction;
}

export async function sendAndConfirmTransactionWrapper(connection, transaction, signers) {
    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, signers, { skipPreflight: true, preflightCommitment: 'confirmed' });
        console.log('Transaction confirmed with signature:', signature);
        return signature;
    } catch (error) {
        console.error('Error sending transaction:', error);
        return null;
    }
}

export function bufferFromUInt64(value) {
    // Create an 8-byte buffer for a 64-bit integer in a browser-compatible way
    const arr = new Uint8Array(8);
    // Convert value to BigInt and write as little endian
    let bigintValue = BigInt(value);
    for (let i = 0; i < 8; i++) {
        arr[i] = Number(bigintValue & BigInt(0xFF));
        bigintValue = bigintValue >> BigInt(8);
    }
    return Buffer.from(arr);
}

export function generatePubKey({
    fromPublicKey,
    programId = TOKEN_PROGRAM_ID,
}) {
    const seed = Keypair.generate().publicKey.toBase58().slice(0, 32);
    
    const publicKey = createWithSeed(fromPublicKey, seed, programId);
    return { publicKey, seed };
}
  
function createWithSeed(fromPublicKey, seed, programId) {
    const buffer = Buffer.concat([
        fromPublicKey.toBuffer(),
        Buffer.from(seed),
        programId.toBuffer()
    ]);
    const publicKeyBytes = sha256(buffer);
    return new PublicKey(publicKeyBytes);
}
  
export function bufferFromString(value) {
    // Create a buffer for a string length prefix followed by the string data
    const strBytes = new TextEncoder().encode(value);
    const lenBytes = new Uint8Array(4);
    
    // Write string length as little-endian uint32
    lenBytes[0] = strBytes.length & 0xff;
    lenBytes[1] = (strBytes.length >> 8) & 0xff;
    lenBytes[2] = (strBytes.length >> 16) & 0xff;
    lenBytes[3] = (strBytes.length >> 24) & 0xff;
    
    // Concatenate length and string data
    const combined = new Uint8Array(4 + strBytes.length);
    combined.set(lenBytes, 0);
    combined.set(strBytes, 4);
    
    return Buffer.from(combined);
} 