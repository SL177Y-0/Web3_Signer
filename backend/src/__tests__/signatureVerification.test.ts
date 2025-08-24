import { verifySignature } from '../utils/signatureVerification';

describe('Signature Verification', () => {
  it('should reject empty message', async () => {
    const result = await verifySignature('', '0x123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject empty signature', async () => {
    const result = await verifySignature('test message', '');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject invalid hex signature', async () => {
    const result = await verifySignature('test message', 'invalid-signature');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('hex string');
  });

  // Note: Add more comprehensive tests once ethers.js is installed
  // and we can test with actual valid signatures
}); 