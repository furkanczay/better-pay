import { describe, it, expect } from 'vitest';
import { BetterPay } from './BetterPay';
import { ProviderType } from './BetterPayConfig';

describe('BetterPay', () => {
  describe('Initialization', () => {
    it('should initialize with single provider', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
        },
      });

      expect(betterPay.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
      expect(betterPay.isProviderEnabled(ProviderType.PAYTR)).toBe(false);
    });

    it('should initialize with multiple providers', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
          paytr: {
            enabled: true,
            config: {
              apiKey: 'test-merchant-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
              merchantId: 'test-merchant-id',
              merchantSalt: 'test-merchant-salt',
            },
          },
        },
      });

      expect(betterPay.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
      expect(betterPay.isProviderEnabled(ProviderType.PAYTR)).toBe(true);
    });

    it('should set default provider automatically if only one is enabled', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
        },
      });

      const enabledProviders = betterPay.getEnabledProviders();
      expect(enabledProviders).toHaveLength(1);
      expect(enabledProviders[0]).toBe(ProviderType.IYZICO);
    });

    it('should respect defaultProvider config', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
          paytr: {
            enabled: true,
            config: {
              apiKey: 'test-merchant-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
              merchantId: 'test-merchant-id',
              merchantSalt: 'test-merchant-salt',
            },
          },
        },
        defaultProvider: ProviderType.PAYTR,
      });

      expect(betterPay.getEnabledProviders()).toHaveLength(2);
    });

    it('should throw error if default provider is not enabled', () => {
      expect(() => {
        new BetterPay({
          providers: {
            iyzico: {
              enabled: true,
              config: {
                apiKey: 'test-key',
                secretKey: 'test-secret',
                baseUrl: 'https://test.com',
              },
            },
          },
          defaultProvider: ProviderType.PAYTR,
        });
      }).toThrow("Default provider 'paytr' is not enabled or configured");
    });
  });

  describe('Provider Access', () => {
    it('should return provider instance with use()', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
        },
      });

      const provider = betterPay.use(ProviderType.IYZICO);
      expect(provider).toBeDefined();
    });

    it('should throw error when accessing disabled provider', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
        },
      });

      expect(() => {
        betterPay.use(ProviderType.PAYTR);
      }).toThrow("Provider 'paytr' is not enabled or configured");
    });
  });

  describe('Enabled Providers', () => {
    it('should list all enabled providers', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
          paytr: {
            enabled: true,
            config: {
              apiKey: 'test-merchant-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
              merchantId: 'test-merchant-id',
              merchantSalt: 'test-merchant-salt',
            },
          },
        },
      });

      const providers = betterPay.getEnabledProviders();
      expect(providers).toContain(ProviderType.IYZICO);
      expect(providers).toContain(ProviderType.PAYTR);
      expect(providers).toHaveLength(2);
    });

    it('should check if specific provider is enabled', () => {
      const betterPay = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test-key',
              secretKey: 'test-secret',
              baseUrl: 'https://test.com',
            },
          },
        },
      });

      expect(betterPay.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
      expect(betterPay.isProviderEnabled(ProviderType.PAYTR)).toBe(false);
    });
  });
});
