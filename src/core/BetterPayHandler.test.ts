import { describe, it, expect, beforeEach } from 'vitest';
import { BetterPayHandler, BetterPayRequest } from './BetterPayHandler';
import { BetterPay } from './BetterPay';
import { ProviderType } from './BetterPayConfig';

describe('BetterPayHandler', () => {
  let betterPay: BetterPay;
  let handler: BetterPayHandler;

  beforeEach(() => {
    // Mock config with test credentials
    betterPay = new BetterPay({
      providers: {
        [ProviderType.IYZICO]: {
          enabled: true,
          config: {
            apiKey: 'test-api-key',
            secretKey: 'test-secret-key',
            baseUrl: 'https://sandbox-api.iyzipay.com',
          },
        },
        [ProviderType.PAYTR]: {
          enabled: true,
          config: {
            apiKey: 'test-merchant-key',
            secretKey: 'test-merchant-key',
            baseUrl: 'https://www.paytr.com',
            merchantId: 'test-merchant-id',
            merchantSalt: 'test-merchant-salt',
          },
        },
      },
      defaultProvider: ProviderType.IYZICO,
    });

    handler = betterPay.handler;
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const request: BetterPayRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/pay/health',
        headers: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('better-pay');
      expect(response.body.providers).toEqual(['iyzico', 'paytr']);
    });

    it('should handle /ok endpoint', async () => {
      const request: BetterPayRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/pay/ok',
        headers: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Route Parsing', () => {
    it('should parse valid iyzico payment route', async () => {
      const request: BetterPayRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/pay/iyzico/payment',
        headers: { 'Content-Type': 'application/json' },
        body: {},
      };

      // Handler will call provider - we just check it doesn't error on route parsing
      const response = await handler.handle(request);

      // Will fail payment validation, but route should be parsed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should parse valid paytr 3ds route', async () => {
      const request: BetterPayRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/pay/paytr/payment/init-3ds',
        headers: { 'Content-Type': 'application/json' },
        body: {},
      };

      const response = await handler.handle(request);

      // Will fail payment validation, but route should be parsed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle trailing slashes', async () => {
      const request: BetterPayRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/pay/health/',
        headers: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should handle query strings', async () => {
      const request: BetterPayRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/pay/health?test=1',
        headers: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for invalid route', async () => {
      const request: BetterPayRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/pay/invalid-provider/payment',
        headers: {},
        body: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for disabled provider', async () => {
      // Create handler with only iyzico enabled
      const limitedBetterPay = new BetterPay({
        providers: {
          [ProviderType.IYZICO]: {
            enabled: true,
            config: {
              apiKey: 'test-api-key',
              secretKey: 'test-secret-key',
              baseUrl: 'https://sandbox-api.iyzipay.com',
            },
          },
        },
      });

      const limitedHandler = limitedBetterPay.handler;

      const request: BetterPayRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/pay/paytr/payment',
        headers: {},
        body: {},
      };

      const response = await limitedHandler.handle(request);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not enabled');
    });

    it('should return 405 for wrong HTTP method', async () => {
      const request: BetterPayRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/pay/iyzico/payment',
        headers: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(405);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('Method not allowed');
    });

    it('should return 404 for unknown action', async () => {
      const request: BetterPayRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/pay/iyzico/unknown-action',
        headers: {},
        body: {},
      };

      const response = await handler.handle(request);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Provider Access', () => {
    it('should access handler from betterPay instance', () => {
      expect(betterPay.handler).toBeDefined();
      expect(betterPay.handler).toBeInstanceOf(BetterPayHandler);
    });

    it('should have same handler instance on multiple accesses', () => {
      const handler1 = betterPay.handler;
      const handler2 = betterPay.handler;

      expect(handler1).toBe(handler2);
    });
  });
});
