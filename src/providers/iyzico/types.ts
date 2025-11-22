/**
 * İyzico API yanıt tipleri
 */

export interface IyzicoResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoPaymentResponse extends IyzicoResponse {
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  binNumber?: string;
  lastFourDigits?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardToken?: string;
  cardUserKey?: string;
  fraudStatus?: number;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  paymentTransactionId?: string;
}

export interface IyzicoThreeDSInitResponse extends IyzicoResponse {
  threeDSHtmlContent?: string;
  paymentId?: string;
  token?: string;
}

export interface IyzicoRefundResponse extends IyzicoResponse {
  paymentId?: string;
  paymentTransactionId?: string;
  price?: number;
  currency?: string;
}

export interface IyzicoCancelResponse extends IyzicoResponse {
  paymentId?: string;
  price?: number;
  currency?: string;
}

/**
 * İyzico API istek tipleri
 */

export interface IyzicoPaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: number;
}

export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  gsmNumber: string;
  email: string;
  identityNumber: string;
  lastLoginDate?: string;
  registrationDate?: string;
  registrationAddress: string;
  ip: string;
  city: string;
  country: string;
  zipCode?: string;
}

export interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: string;
  price: string;
}

export interface IyzicoPaymentRequest {
  locale: string;
  conversationId?: string;
  price: string;
  paidPrice: string;
  currency: string;
  installment: number;
  basketId: string;
  paymentChannel: string;
  paymentGroup: string;
  paymentCard: IyzicoPaymentCard;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
  callbackUrl?: string;
}

/**
 * İyzico Checkout Form İstek Tipi
 */
export interface IyzicoCheckoutFormRequest {
  locale: string;
  conversationId?: string;
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentGroup: string;
  callbackUrl: string;
  enabledInstallments?: number[];
  paymentChannel?: string;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
}

/**
 * İyzico Checkout Form Initialize Response
 */
export interface IyzicoCheckoutFormInitResponse extends IyzicoResponse {
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  token?: string;
  tokenExpireTime?: number;
}

/**
 * İyzico Checkout Form Retrieve Response
 */
export interface IyzicoCheckoutFormRetrieveResponse extends IyzicoResponse {
  paymentId?: string;
  paymentStatus?: string;
  fraudStatus?: number;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  installment?: number;
  binNumber?: string;
  lastFourDigits?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardToken?: string;
  cardUserKey?: string;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  paymentTransactionId?: string;
}

export interface IyzicoBinCheckRequest {
  locale?: string;
  conversationId?: string;
  binNumber: string;
}

export interface IyzicoBinCheckResponse extends IyzicoResponse {
  binNumber?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  bankName?: string;
  bankCode?: number;
  commercial?: number;
}
