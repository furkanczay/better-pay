import { describe, it, expect, beforeEach } from 'vitest';
import { PayTR } from './index';
import { PaymentStatus } from '../../types';

describe('PayTR Provider', () => {
  let paytr: PayTR;

  const validConfig = {
    apiKey: 'test-merchant-key',
    secretKey: 'test-secret-key',
    baseUrl: 'https://www.paytr.com',
    merchantId: 'test-merchant-id',
    merchantSalt: 'test-merchant-salt',
  };

  beforeEach(() => {
    paytr = new PayTR(validConfig);
  });

  it('should create PayTR instance', () => {
    expect(paytr).toBeInstanceOf(PayTR);
  });

  it('should throw error when merchantId is missing', () => {
    expect(() => {
      new PayTR({
        ...validConfig,
        merchantId: '',
      });
    }).toThrow('Merchant ID is required');
  });

  it('should throw error when merchantSalt is missing', () => {
    expect(() => {
      new PayTR({
        ...validConfig,
        merchantSalt: '',
      });
    }).toThrow('Merchant Salt is required');
  });

  it('should throw error when apiKey is missing', () => {
    expect(() => {
      new PayTR({
        ...validConfig,
        apiKey: '',
      });
    }).toThrow('API Key is required');
  });

  it('should throw error when baseUrl is missing', () => {
    expect(() => {
      new PayTR({
        ...validConfig,
        baseUrl: '',
      });
    }).toThrow('Base URL is required');
  });

  it('should have all required methods', () => {
    expect(typeof paytr.createPayment).toBe('function');
    expect(typeof paytr.initThreeDSPayment).toBe('function');
    expect(typeof paytr.completeThreeDSPayment).toBe('function');
    expect(typeof paytr.refund).toBe('function');
    expect(typeof paytr.cancel).toBe('function');
    expect(typeof paytr.getPayment).toBe('function');
  });

  describe('getPayment', () => {
    it('should return pending status with info message', async () => {
      const result = await paytr.getPayment('test-payment-id');

      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paymentId).toBe('test-payment-id');
      expect(result.errorMessage).toContain('does not provide payment query');
    });
  });
});
