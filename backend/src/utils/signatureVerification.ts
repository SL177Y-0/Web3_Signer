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

    if (!message || !signature) {
      return {
        isValid: false,
        error: 'Message and signature are required'
      };
    }

    if (!ethers.isHexString(signature)) {
      return {
        isValid: false,
        error: 'Signature must be a valid hex string'
      };
    }

    const recoveredSigner = ethers.verifyMessage(message, signature);

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

    return {
      isValid: false,
      error: error.message || 'Signature verification failed'
    };
  }
}
