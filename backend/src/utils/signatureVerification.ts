import { ethers } from 'ethers';

export interface VerificationResult {
  isValid: boolean;
  signer?: string;
  error?: string;
}

/**
 * Verifies an Ethereum message signature using ethers.js
 * @param message - Original message that was signed
 * @param signature - Hex-encoded signature string
 * @returns Promise<VerificationResult>
 */
export async function verifySignature(
  message: string, 
  signature: string
): Promise<VerificationResult> {
  try {
    // Input validation
    if (!message || !signature) {
      return {
        isValid: false,
        error: 'Message and signature are required'
      };
    }

    // Verify signature format
    if (!ethers.isHexString(signature)) {
      return {
        isValid: false,
        error: 'Signature must be a valid hex string'
      };
    }

    // Use ethers.js to verify the message signature
    // This will automatically handle the EIP-191 prefixing (\x19Ethereum Signed Message:\n)
    const recoveredSigner = ethers.verifyMessage(message, signature);

    // Check if recovered address is valid
    if (!ethers.isAddress(recoveredSigner)) {
      return {
        isValid: false,
        error: 'Failed to recover valid signer address'
      };
    }

    return {
      isValid: true,
      signer: recoveredSigner
    };

  } catch (error: any) {
    console.error('Signature verification failed:', error);
    
    // Handle specific ethers errors
    if (error.code === 'INVALID_ARGUMENT') {
      return {
        isValid: false,
        error: 'Invalid signature format or message encoding'
      };
    }
    
    if (error.code === 'BAD_DATA') {
      return {
        isValid: false,
        error: 'Malformed signature data'
      };
    }

    // Generic error handling
    return {
      isValid: false,
      error: error.message || 'Signature verification failed'
    };
  }
}

/**
 * Alternative verification method using viem (commented for reference)
 * This could be used instead of ethers.js for more modern Web3 support
 */
/*
import { verifyMessage, recoverMessageAddress } from 'viem';

export async function verifySignatureWithViem(
  message: string, 
  signature: string
): Promise<VerificationResult> {
  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`
    });

    return {
      isValid: true,
      signer: recoveredAddress
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Signature verification failed'
    };
  }
}
*/ 