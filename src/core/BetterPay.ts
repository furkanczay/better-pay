import { PaymentProvider, PaymentProviderConfig } from './PaymentProvider';
import { BetterPayConfig, ProviderType, ProviderInstances } from './BetterPayConfig';
import { Iyzico } from '../providers/iyzico';
import { PayTR } from '../providers/paytr';
import {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
} from '../types';
import { BetterPayHandler } from './BetterPayHandler';

/**
 * BetterPay - Merkezi ödeme yönetim sınıfı
 *
 * Config dosyası ile tüm payment provider'ları tek yerden yönetmenizi sağlar.
 *
 * @example
 * ```typescript
 * const betterPay = new BetterPay({
 *   providers: {
 *     iyzico: {
 *       enabled: true,
 *       config: {
 *         apiKey: 'your-api-key',
 *         secretKey: 'your-secret-key',
 *         baseUrl: 'https://sandbox-api.iyzipay.com'
 *       }
 *     },
 *     paytr: {
 *       enabled: true,
 *       config: {
 *         merchantId: 'your-merchant-id',
 *         merchantKey: 'your-merchant-key',
 *         merchantSalt: 'your-merchant-salt',
 *         baseUrl: 'https://www.paytr.com'
 *       }
 *     }
 *   },
 *   defaultProvider: 'iyzico'
 * });
 *
 * // Kullanım şekilleri:
 *
 * // 1. Default provider kullanarak (defaultProvider: 'iyzico' olarak ayarlanmış)
 * const result = await betterPay.createPayment({ ... });
 *
 * // 2. Belirli bir provider kullanarak (use metodu)
 * const result = await betterPay.use('paytr').createPayment({ ... });
 *
 * // 3. Provider'a doğrudan erişim (önerilen yöntem)
 * const iyzicoResult = await betterPay.iyzico.createPayment({ ... });
 * const paytrResult = await betterPay.paytr.createPayment({ ... });
 *
 * // 4. Multi-provider kullanımı (aynı uygulamada farklı provider'lar)
 * const payment1 = await betterPay.iyzico.initThreeDSPayment({ ... });
 * const payment2 = await betterPay.paytr.initThreeDSPayment({ ... });
 * ```
 */
export class BetterPay {
  private config: BetterPayConfig;
  private providers: ProviderInstances = {};
  private defaultProvider?: ProviderType;
  private _handler: BetterPayHandler;

  constructor(config: BetterPayConfig) {
    this.config = config;
    this.defaultProvider = config.defaultProvider;
    this.initializeProviders();
    this._handler = new BetterPayHandler(this);
  }

  /**
   * HTTP handler for framework integrations
   *
   * Use this with framework adapters to create automatic API endpoints:
   *
   * @example
   * ```typescript
   * // Next.js App Router
   * import { toNextJsHandler } from 'better-pay/next-js';
   * export const { GET, POST } = toNextJsHandler(betterPay.handler);
   *
   * // Express
   * import { toNodeHandler } from 'better-pay/node';
   * app.all('/api/pay/*', toNodeHandler(betterPay));
   * ```
   */
  get handler(): BetterPayHandler {
    return this._handler;
  }

  /**
   * Provider'ları başlat
   */
  private initializeProviders(): void {
    // İyzico provider'ı başlat
    if (this.config.providers[ProviderType.IYZICO]?.enabled) {
      const iyzicoConfig = this.config.providers[ProviderType.IYZICO].config;
      this.validateIyzicoConfig(iyzicoConfig);
      this.providers[ProviderType.IYZICO] = new Iyzico(iyzicoConfig);
    }

    // PayTR provider'ı başlat
    if (this.config.providers[ProviderType.PAYTR]?.enabled) {
      const paytrConfig = this.config.providers[ProviderType.PAYTR].config;
      this.validatePayTRConfig(paytrConfig);
      this.providers[ProviderType.PAYTR] = new PayTR(paytrConfig as any);
    }

    // Default provider kontrolü
    if (this.defaultProvider && !this.providers[this.defaultProvider]) {
      throw new Error(`Default provider '${this.defaultProvider}' is not enabled or configured`);
    }

    // Eğer sadece bir provider varsa onu default yap
    if (!this.defaultProvider) {
      const enabledProviders = Object.keys(this.providers) as ProviderType[];
      if (enabledProviders.length === 1) {
        this.defaultProvider = enabledProviders[0];
      }
    }
  }

  /**
   * İyzico config validation
   */
  private validateIyzicoConfig(config: PaymentProviderConfig): void {
    const missingFields: string[] = [];

    if (!config.apiKey) {
      missingFields.push('apiKey (IYZICO_API_KEY)');
    }
    if (!config.secretKey) {
      missingFields.push('secretKey (IYZICO_SECRET_KEY)');
    }
    if (!config.baseUrl) {
      missingFields.push('baseUrl (IYZICO_BASE_URL)');
    }

    if (missingFields.length > 0) {
      throw new Error(
        `Iyzico provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}\n\n` +
          `Please add these environment variables to your .env file:\n` +
          `  IYZICO_API_KEY=your-api-key\n` +
          `  IYZICO_SECRET_KEY=your-secret-key\n` +
          `  IYZICO_BASE_URL=https://sandbox-api.iyzipay.com\n\n` +
          `Or configure them directly in your BetterPay config.`
      );
    }
  }

  /**
   * PayTR config validation
   */
  private validatePayTRConfig(
    config: PaymentProviderConfig & { merchantId: string; merchantSalt: string }
  ): void {
    const missingFields: string[] = [];

    if (!config.merchantId) {
      missingFields.push('merchantId (PAYTR_MERCHANT_ID)');
    }
    if (!config.secretKey) {
      missingFields.push('merchantKey (PAYTR_MERCHANT_KEY)');
    }
    if (!config.merchantSalt) {
      missingFields.push('merchantSalt (PAYTR_MERCHANT_SALT)');
    }
    if (!config.baseUrl) {
      missingFields.push('baseUrl (PAYTR_BASE_URL)');
    }

    if (missingFields.length > 0) {
      throw new Error(
        `PayTR provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}\n\n` +
          `Please add these environment variables to your .env file:\n` +
          `  PAYTR_MERCHANT_ID=your-merchant-id\n` +
          `  PAYTR_MERCHANT_KEY=your-merchant-key\n` +
          `  PAYTR_MERCHANT_SALT=your-merchant-salt\n` +
          `  PAYTR_BASE_URL=https://www.paytr.com\n\n` +
          `Or configure them directly in your BetterPay config.`
      );
    }
  }

  /**
   * Belirli bir provider kullan
   */
  use(providerType: ProviderType): PaymentProvider {
    const provider = this.providers[providerType];
    if (!provider) {
      throw new Error(
        `Provider '${providerType}' is not enabled or configured. ` +
          `Please check your BetterPay configuration.`
      );
    }
    return provider;
  }

  /**
   * Default provider'ı getir
   */
  private getDefaultProvider(): PaymentProvider {
    if (!this.defaultProvider) {
      throw new Error(
        'No default provider set. Please specify a provider using .use() method ' +
          'or set defaultProvider in configuration.'
      );
    }
    return this.use(this.defaultProvider);
  }

  /**
   * Aktif provider'ları listele
   */
  getEnabledProviders(): ProviderType[] {
    return Object.keys(this.providers) as ProviderType[];
  }

  /**
   * Belirli bir provider'ın aktif olup olmadığını kontrol et
   */
  isProviderEnabled(providerType: ProviderType): boolean {
    return !!this.providers[providerType];
  }

  /**
   * Default provider ile ödeme oluştur
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.getDefaultProvider().createPayment(request);
  }

  /**
   * Default provider ile 3DS ödeme başlat
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    return this.getDefaultProvider().initThreeDSPayment(request);
  }

  /**
   * Default provider ile 3DS ödeme tamamla
   */
  async completeThreeDSPayment(callbackData: any): Promise<PaymentResponse> {
    return this.getDefaultProvider().completeThreeDSPayment(callbackData);
  }

  /**
   * Default provider ile iade yap
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    return this.getDefaultProvider().refund(request);
  }

  /**
   * Default provider ile ödeme iptal et
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    return this.getDefaultProvider().cancel(request);
  }

  /**
   * Default provider ile ödeme sorgula
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    return this.getDefaultProvider().getPayment(paymentId);
  }

  /**
   * İyzico provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.iyzico.createPayment({ ... });
   * ```
   *
   * @throws Error if Iyzico provider is not enabled or configured
   */
  get iyzico(): PaymentProvider {
    const provider = this.providers[ProviderType.IYZICO];
    if (!provider) {
      const enabledProviders = this.getEnabledProviders();
      throw new Error(
        `Iyzico provider is not enabled or configured.\n` +
          `Enabled providers: ${enabledProviders.length > 0 ? enabledProviders.join(', ') : 'none'}\n` +
          `Please add Iyzico configuration to your BetterPay config:\n` +
          `{\n` +
          `  providers: {\n` +
          `    iyzico: {\n` +
          `      enabled: true,\n` +
          `      config: {\n` +
          `        apiKey: process.env.IYZICO_API_KEY,\n` +
          `        secretKey: process.env.IYZICO_SECRET_KEY,\n` +
          `        baseUrl: 'https://sandbox-api.iyzipay.com'\n` +
          `      }\n` +
          `    }\n` +
          `  }\n` +
          `}`
      );
    }
    return provider;
  }

  /**
   * PayTR provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.paytr.createPayment({ ... });
   * ```
   *
   * @throws Error if PayTR provider is not enabled or configured
   */
  get paytr(): PaymentProvider {
    const provider = this.providers[ProviderType.PAYTR];
    if (!provider) {
      const enabledProviders = this.getEnabledProviders();
      throw new Error(
        `PayTR provider is not enabled or configured.\n` +
          `Enabled providers: ${enabledProviders.length > 0 ? enabledProviders.join(', ') : 'none'}\n` +
          `Please add PayTR configuration to your BetterPay config:\n` +
          `{\n` +
          `  providers: {\n` +
          `    paytr: {\n` +
          `      enabled: true,\n` +
          `      config: {\n` +
          `        merchantId: process.env.PAYTR_MERCHANT_ID,\n` +
          `        merchantKey: process.env.PAYTR_MERCHANT_KEY,\n` +
          `        merchantSalt: process.env.PAYTR_MERCHANT_SALT,\n` +
          `        baseUrl: 'https://www.paytr.com'\n` +
          `      }\n` +
          `    }\n` +
          `  }\n` +
          `}`
      );
    }
    return provider;
  }
}
