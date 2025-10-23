import { describe, it, expect } from 'vitest';
import {
  generateRandomString,
  generateIyzicoAuthStringV2,
  generateIyzicoAuthStringV1,
} from './utils';

describe('Iyzico Utils', () => {
  it('should generate random string', () => {
    const randomString = generateRandomString();
    expect(randomString).toBeDefined();
    expect(randomString.length).toBeGreaterThan(10); // timestamp + random
  });

  it('should generate different random strings', () => {
    const str1 = generateRandomString();
    const str2 = generateRandomString();
    expect(str1).not.toBe(str2);
  });

  it('should generate V2 auth string', () => {
    const apiKey = 'test-api-key';
    const secretKey = 'test-secret-key';
    const randomString = 'test-random';
    const uri = '/payment/auth';
    const requestBody = '{"test":"data"}';

    const authString = generateIyzicoAuthStringV2(
      apiKey,
      secretKey,
      randomString,
      uri,
      requestBody
    );
    expect(authString).toContain('IYZWSv2');
    expect(authString).toMatch(/^IYZWSv2 [A-Za-z0-9+/=]+$/);
  });

  it('should generate V1 auth string for fallback', () => {
    const apiKey = 'test-api-key';
    const secretKey = 'test-secret-key';
    const randomString = 'test-random';
    const pkiString = 'test-pki';

    const authString = generateIyzicoAuthStringV1(apiKey, secretKey, randomString, pkiString);
    expect(authString).toContain('IYZWS');
    expect(authString).toContain(apiKey);
  });
});
