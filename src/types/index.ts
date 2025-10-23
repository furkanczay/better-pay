/**
 * Ödeme durumu enum'u
 */
export enum PaymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

/**
 * Para birimi
 */
export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

/**
 * Ödeme kartı bilgileri
 */
export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: boolean;
}

/**
 * Alıcı bilgileri
 */
export interface Buyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  zipCode?: string;
  ip: string;
  gsmNumber?: string;
}

/**
 * Adres bilgileri
 */
export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

/**
 * Sepet item tipi
 */
export enum BasketItemType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

/**
 * Sepet item
 */
export interface BasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: BasketItemType | string;
  price: string;
}

/**
 * Ödeme isteği parametreleri
 */
export interface PaymentRequest {
  price: string;
  paidPrice: string;
  currency: Currency | string;
  basketId: string;
  paymentCard: PaymentCard;
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
  callbackUrl?: string;
  conversationId?: string;
}

/**
 * Ödeme yanıtı
 */
export interface PaymentResponse {
  status: PaymentStatus;
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  rawResponse?: any;
}

/**
 * 3D Secure ödeme isteği
 */
export interface ThreeDSPaymentRequest extends PaymentRequest {
  callbackUrl: string;
}

/**
 * 3D Secure ödeme başlatma yanıtı
 */
export interface ThreeDSInitResponse {
  status: PaymentStatus;
  threeDSHtmlContent?: string;
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
}

/**
 * İade isteği
 */
export interface RefundRequest {
  paymentId: string;
  price: string;
  currency: Currency | string;
  ip: string;
  conversationId?: string;
}

/**
 * İade yanıtı
 */
export interface RefundResponse {
  status: PaymentStatus;
  refundId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
}

/**
 * İptal isteği
 */
export interface CancelRequest {
  paymentId: string;
  ip: string;
  conversationId?: string;
}

/**
 * İptal yanıtı
 */
export interface CancelResponse {
  status: PaymentStatus;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
}
