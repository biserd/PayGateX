import crypto from 'crypto';

export class ApiKeyService {
  generateKey(): { key: string; hash: string; prefix: string } {
    const key = `pk_live_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 12);
    
    return { key, hash, prefix };
  }

  hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  verifyKey(key: string, hash: string): boolean {
    const keyHash = this.hashKey(key);
    return keyHash === hash;
  }
}

export const apiKeyService = new ApiKeyService();
