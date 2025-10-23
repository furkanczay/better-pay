import { describe, it, expect, beforeEach } from 'vitest';
import { Iyzico } from './index';

describe('Iyzico Provider', () => {
  let iyzico: Iyzico;

  beforeEach(() => {
    iyzico = new Iyzico({
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      baseUrl: 'https://sandbox-api.iyzipay.com',
    });
  });

  it('should create Iyzico instance', () => {
    expect(iyzico).toBeInstanceOf(Iyzico);
  });

  it('should throw error when apiKey is missing', () => {
    expect(() => {
      new Iyzico({
        apiKey: '',
        secretKey: 'test-secret',
        baseUrl: 'https://sandbox-api.iyzipay.com',
      });
    }).toThrow('API Key is required');
  });

  it('should throw error when secretKey is missing', () => {
    expect(() => {
      new Iyzico({
        apiKey: 'test-api',
        secretKey: '',
        baseUrl: 'https://sandbox-api.iyzipay.com',
      });
    }).toThrow('Secret Key is required');
  });

  it('should throw error when baseUrl is missing', () => {
    expect(() => {
      new Iyzico({
        apiKey: 'test-api',
        secretKey: 'test-secret',
        baseUrl: '',
      });
    }).toThrow('Base URL is required');
  });

  // Mock test - gerçek API çağrısı yapmadan test
  it('should have all required methods', () => {
    expect(typeof iyzico.createPayment).toBe('function');
    expect(typeof iyzico.initThreeDSPayment).toBe('function');
    expect(typeof iyzico.completeThreeDSPayment).toBe('function');
    expect(typeof iyzico.refund).toBe('function');
    expect(typeof iyzico.cancel).toBe('function');
    expect(typeof iyzico.getPayment).toBe('function');
  });
});
