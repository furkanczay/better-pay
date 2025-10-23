import { PaymentProviderConfig } from './PaymentProvider';

/**
 * Provider türleri
 */
export enum ProviderType {
  IYZICO = 'iyzico',
  PAYTR = 'paytr',
}

/**
 * İyzico provider config
 */
export interface IyzicoProviderConfig {
  enabled: boolean;
  config: PaymentProviderConfig;
}

/**
 * PayTR provider config (ek alanlar gerekiyor)
 */
export interface PayTRProviderConfig {
  enabled: boolean;
  config: PaymentProviderConfig & {
    merchantId: string;
    merchantSalt: string;
  };
}

/**
 * Her provider için config (generic type)
 */
export interface ProviderConfig {
  enabled: boolean;
  config:
    | PaymentProviderConfig
    | (PaymentProviderConfig & { merchantId: string; merchantSalt: string });
}

/**
 * BetterPay ana konfigürasyonu
 */
export interface BetterPayConfig {
  providers: {
    [ProviderType.IYZICO]?: IyzicoProviderConfig;
    [ProviderType.PAYTR]?: PayTRProviderConfig;
  };
  defaultProvider?: ProviderType;
}

/**
 * Provider instance map
 */
export interface ProviderInstances {
  [ProviderType.IYZICO]?: any;
  [ProviderType.PAYTR]?: any;
}
