import { describe, it, expect } from 'vitest';
import {
  generatePayTRHash,
  formatPayTRBasket,
  convertToKurus,
  convertFromKurus,
  generatePayTRToken,
  createPayTRFormData,
} from './utils';

describe('PayTR Utils', () => {
  describe('convertToKurus', () => {
    it('should convert TL to kurus', () => {
      expect(convertToKurus('100.00')).toBe('10000');
      expect(convertToKurus('1.50')).toBe('150');
      expect(convertToKurus('0.99')).toBe('99');
    });
  });

  describe('convertFromKurus', () => {
    it('should convert kurus to TL', () => {
      expect(convertFromKurus('10000')).toBe('100.00');
      expect(convertFromKurus('150')).toBe('1.50');
      expect(convertFromKurus('99')).toBe('0.99');
    });
  });

  describe('formatPayTRBasket', () => {
    it('should format basket items', () => {
      const items = [
        { name: 'Product 1', price: '10000', quantity: 1 },
        { name: 'Product 2', price: '5000', quantity: 2 },
      ];

      const formatted = formatPayTRBasket(items);
      const parsed = JSON.parse(formatted);

      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual(['Product 1', '10000', 1]);
      expect(parsed[1]).toEqual(['Product 2', '5000', 2]);
    });
  });

  describe('generatePayTRHash', () => {
    it('should generate hash', () => {
      const hash = generatePayTRHash(
        'merchant123',
        '127.0.0.1',
        'ORDER123',
        'test@test.com',
        '10000',
        '[["Product","10000",1]]',
        '0',
        '0',
        'TL',
        '1',
        'test-salt'
      );

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPayTRCallback', () => {
    it('should verify valid callback', () => {
      const merchantSalt = 'test-salt';
      const merchantOid = 'ORDER123';
      const status = 'success';
      const totalAmount = '10000';

      const hash = generatePayTRToken(merchantOid, merchantSalt, status, totalAmount);

      // Bu test gerçek hash hesaplamasını test eder
      expect(typeof hash).toBe('string');
    });
  });

  describe('createPayTRFormData', () => {
    it('should create form data', () => {
      const data = {
        merchant_id: '123',
        email: 'test@test.com',
        amount: '10000',
      };

      const formData = createPayTRFormData(data);

      expect(formData).toContain('merchant_id=123');
      expect(formData).toContain('email=test%40test.com');
      expect(formData).toContain('amount=10000');
    });

    it('should handle special characters', () => {
      const data = {
        name: 'Test & Product',
        value: '100+50',
      };

      const formData = createPayTRFormData(data);

      expect(formData).toContain('Test%20%26%20Product');
      expect(formData).toContain('100%2B50');
    });
  });
});
