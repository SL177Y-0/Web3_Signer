import { ethers } from 'ethers'

export interface SignatureResult {
  signature: string
  message: string
  signer: string
}

export interface VerificationResponse {
  isValid: boolean
  signer: string
  originalMessage: string
  timestamp: string
  error?: string
}

/**
 * Sign a message using the wallet's signer
 */
export async function signMessageWithWallet(
  wallet: any,
  message: string
): Promise<SignatureResult> {
  try {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    // Get the wallet client from Dynamic.xyz
    const walletClient = await wallet.getWalletClient()
    
    // Create ethers provider and signer
    const provider = new ethers.BrowserProvider(walletClient)
    const signer = await provider.getSigner()
    
    // Sign the message
    const signature = await signer.signMessage(message)
    const signerAddress = await signer.getAddress()

    return {
      signature,
      message,
      signer: signerAddress
    }
  } catch (error: any) {
    console.error('Error signing message:', error)
    throw new Error(error.message || 'Failed to sign message')
  }
}

/**
 * Verify a signature with the backend API
 */
export async function verifySignatureWithAPI(
  message: string,
  signature: string
): Promise<VerificationResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    const response = await fetch(`${apiUrl}/verify-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed')
    }

    return data
  } catch (error: any) {
    console.error('Error verifying signature:', error)
    throw new Error(error.message || 'Failed to verify signature')
  }
}

/**
 * Check if the backend is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    const response = await fetch(`${apiUrl}/health`)
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address)
}

/**
 * Validate signature format
 */
export function isValidSignature(signature: string): boolean {
  return (
    typeof signature === 'string' &&
    signature.startsWith('0x') &&
    signature.length === 132 &&
    ethers.isHexString(signature)
  )
} 