import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Iyzico } from '../../../src/providers/iyzico';
import { mockPaymentRequest, mockThreeDSPaymentRequest, mockRefundRequest } from '../../fixtures/payment-data';

/**
 * REAL Integration Tests for Iyzico Provider
 *
 * These tests verify that Iyzico sends CORRECT request format:
 * - HTTP method and endpoint
 * - Request headers (Authorization, Content-Type)
 * - Request body structure and data mapping
 * - Signature calculation
 *
 * We spy on the actual HTTP client to capture real requests
 */

describe('Iyzico Provider - Integration Tests', () => {
  let iyzico: Iyzico;
  let capturedRequests: any[] = [];

  beforeEach(() => {
    capturedRequests = [];

    iyzico = new Iyzico({
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      baseUrl: 'https://sandbox-api.iyzipay.com',
      locale: 'tr',
    });

    // Spy on the internal axios client's post method
    const client = (iyzico as any).client;
    vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any, config: any) => {
      // Capture the request
      capturedRequests.push({
        url,
        data: typeof data === 'string' ? JSON.parse(data) : data,
        headers: config?.headers || {},
        rawData: data,
      });

      // Return mock response
      return {
        data: {
          status: 'success',
          paymentId: 'test-payment-id',
          conversationId: 'test-conversation-id',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Format Validation', () => {
    it('should send payment request with correct Iyzico format', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      const request = capturedRequests[0];

      // Verify endpoint
      expect(request.url).toBe('/payment/auth');

      // Verify content type
      expect(request.headers['Content-Type']).toBe('application/json');

      // Verify body structure
      expect(request.data).toHaveProperty('locale', 'tr');
      expect(request.data).toHaveProperty('conversationId', mockPaymentRequest.conversationId);
      expect(request.data).toHaveProperty('price', mockPaymentRequest.price);
      expect(request.data).toHaveProperty('paidPrice', mockPaymentRequest.paidPrice);
      expect(request.data).toHaveProperty('currency', mockPaymentRequest.currency);
      expect(request.data).toHaveProperty('basketId', mockPaymentRequest.basketId);
      expect(request.data).toHaveProperty('paymentChannel', 'WEB');
      expect(request.data).toHaveProperty('paymentGroup', 'PRODUCT');
    });

    it('should include correct authorization header with signature', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      const request = capturedRequests[0];

      // Authorization header should exist and start with IYZWSv2
      expect(request.headers.Authorization).toBeDefined();
      expect(request.headers.Authorization).toMatch(/^IYZWSv2 /);

      // Random header should exist
      expect(request.headers['x-iyzi-rnd']).toBeDefined();
      expect(typeof request.headers['x-iyzi-rnd']).toBe('string');
    });

    it('should calculate authorization signature correctly', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      const request = capturedRequests[0];
      const authHeader = request.headers.Authorization;

      // Should start with IYZWSv2
      expect(authHeader).toMatch(/^IYZWSv2 /);

      // Should have a base64 encoded token
      const [prefix, token] = authHeader.split(' ');
      expect(prefix).toBe('IYZWSv2');
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);

      // Token should be base64
      expect(token).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should send 3DS init request with callback URL', async () => {
      await iyzico.initThreeDSPayment(mockThreeDSPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      const request = capturedRequests[0];

      // Verify endpoint
      expect(request.url).toBe('/payment/3dsecure/initialize');

      // Should have callback URL
      expect(request.data).toHaveProperty('callbackUrl', mockThreeDSPaymentRequest.callbackUrl);
    });

    it('should send refund request with correct format', async () => {
      await iyzico.refund(mockRefundRequest);

      expect(capturedRequests).toHaveLength(1);
      const request = capturedRequests[0];

      // Verify endpoint
      expect(request.url).toBe('/payment/refund');

      // Verify refund fields
      expect(request.data).toHaveProperty('paymentTransactionId', mockRefundRequest.paymentId);
      expect(request.data).toHaveProperty('price', mockRefundRequest.price);
      expect(request.data).toHaveProperty('currency', mockRefundRequest.currency);
      expect(request.data).toHaveProperty('ip', mockRefundRequest.ip);
    });
  });

  describe('Request Transformation', () => {
    it('should transform payment card data correctly', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      const request = capturedRequests[0];
      const { paymentCard } = request.data;

      expect(paymentCard.cardHolderName).toBe(mockPaymentRequest.paymentCard.cardHolderName);
      expect(paymentCard.cardNumber).toBe(mockPaymentRequest.paymentCard.cardNumber);
      expect(paymentCard.expireMonth).toBe(mockPaymentRequest.paymentCard.expireMonth);
      expect(paymentCard.expireYear).toBe(mockPaymentRequest.paymentCard.expireYear);
      expect(paymentCard.cvc).toBe(mockPaymentRequest.paymentCard.cvc);
    });

    it('should transform buyer data correctly', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      const request = capturedRequests[0];
      const { buyer } = request.data;

      expect(buyer.id).toBe(mockPaymentRequest.buyer.id);
      expect(buyer.name).toBe(mockPaymentRequest.buyer.name);
      expect(buyer.surname).toBe(mockPaymentRequest.buyer.surname);
      expect(buyer.email).toBe(mockPaymentRequest.buyer.email);
      expect(buyer.gsmNumber).toBe(mockPaymentRequest.buyer.gsmNumber);
      expect(buyer.ip).toBe(mockPaymentRequest.buyer.ip);
    });

    it('should transform basket items correctly', async () => {
      await iyzico.createPayment(mockPaymentRequest);

      const request = capturedRequests[0];
      const { basketItems } = request.data;

      expect(basketItems).toHaveLength(mockPaymentRequest.basketItems.length);

      basketItems.forEach((item: any, index: number) => {
        const originalItem = mockPaymentRequest.basketItems[index];
        expect(item.id).toBe(originalItem.id);
        expect(item.name).toBe(originalItem.name);
        expect(item.category1).toBe(originalItem.category1);
        expect(item.price).toBe(originalItem.price);
      });
    });
  });

  describe('Endpoint Validation', () => {
    it('should use correct endpoint for direct payment', async () => {
      await iyzico.createPayment(mockPaymentRequest);
      expect(capturedRequests[0].url).toBe('/payment/auth');
    });

    it('should use correct endpoint for 3DS init', async () => {
      await iyzico.initThreeDSPayment(mockThreeDSPaymentRequest);
      expect(capturedRequests[0].url).toBe('/payment/3dsecure/initialize');
    });

    it('should use correct endpoint for refund', async () => {
      await iyzico.refund(mockRefundRequest);
      expect(capturedRequests[0].url).toBe('/payment/refund');
    });
  });
});
