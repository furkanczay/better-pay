import axios, { AxiosInstance } from 'axios';
import { PaymentProvider, PaymentProviderConfig } from '../../core/PaymentProvider';
import {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
  PaymentStatus,
} from '../../types';
import { createIyzicoHeaders } from './utils';
import {
  IyzicoPaymentRequest,
  IyzicoPaymentResponse,
  IyzicoThreeDSInitResponse,
  IyzicoRefundResponse,
  IyzicoCancelResponse,
} from './types';

/**
 * İyzico ödeme sağlayıcısı
 */
export class Iyzico extends PaymentProvider {
  private client: AxiosInstance;

  constructor(config: PaymentProviderConfig) {
    super(config);
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * İyzico status'ünü PaymentStatus'e çevir
   */
  private mapStatus(iyzicoStatus: string): PaymentStatus {
    switch (iyzicoStatus) {
      case 'success':
        return PaymentStatus.SUCCESS;
      case 'failure':
        return PaymentStatus.FAILURE;
      default:
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Genel request gönderme metodu
   */
  private async sendRequest<T>(endpoint: string, data: any): Promise<T> {
    const requestBody = JSON.stringify(data);
    const headers = createIyzicoHeaders(
      this.config.apiKey,
      this.config.secretKey,
      endpoint,
      requestBody
    );

    // İmza için kullanılan body ile gönderilen body'nin aynı olması gerekiyor
    const response = await this.client.post<T>(endpoint, requestBody, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  /**
   * Uygulama request'ini İyzico formatına çevir
   */
  private mapToIyzicoRequest(request: PaymentRequest): IyzicoPaymentRequest {
    return {
      locale: this.config.locale || 'tr',
      conversationId: request.conversationId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      installment: 1,
      basketId: request.basketId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: request.paymentCard.cardHolderName,
        cardNumber: request.paymentCard.cardNumber,
        expireMonth: request.paymentCard.expireMonth,
        expireYear: request.paymentCard.expireYear,
        cvc: request.paymentCard.cvc,
        registerCard: request.paymentCard.registerCard ? 1 : 0,
      },
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        gsmNumber: request.buyer.gsmNumber,
        email: request.buyer.email,
        identityNumber: request.buyer.identityNumber,
        registrationAddress: request.buyer.registrationAddress,
        ip: request.buyer.ip,
        city: request.buyer.city,
        country: request.buyer.country,
        zipCode: request.buyer.zipCode,
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
        zipCode: request.shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
        zipCode: request.billingAddress.zipCode,
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2,
        itemType: item.itemType,
        price: item.price,
      })),
    };
  }

  /**
   * Direkt ödeme (3D Secure olmadan)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const iyzicoRequest = this.mapToIyzicoRequest(request);
      const response = await this.sendRequest<IyzicoPaymentResponse>(
        '/payment/auth',
        iyzicoRequest
      );

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Payment failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * 3D Secure ödeme başlat
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    try {
      const iyzicoRequest = {
        ...this.mapToIyzicoRequest(request),
        callbackUrl: request.callbackUrl,
      };

      const response = await this.sendRequest<IyzicoThreeDSInitResponse>(
        '/payment/3dsecure/initialize',
        iyzicoRequest
      );

      // İyzico threeDSHtmlContent'i Base64 encoded olarak döndürür, decode edelim
      let decodedHtmlContent: string | undefined;
      if (response.threeDSHtmlContent) {
        try {
          decodedHtmlContent = Buffer.from(response.threeDSHtmlContent, 'base64').toString('utf-8');
        } catch (decodeError) {
          // Eğer decode edilemezse, raw halini kullan
          decodedHtmlContent = response.threeDSHtmlContent;
        }
      }

      return {
        status: this.mapStatus(response.status),
        threeDSHtmlContent: decodedHtmlContent,
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3DS initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * 3D Secure ödeme tamamla
   */
  async completeThreeDSPayment(callbackData: any): Promise<PaymentResponse> {
    try {
      // Callback'ten gelen token ve conversationId ile ödemeyi tamamla
      const response = await this.sendRequest<IyzicoPaymentResponse>('/payment/3dsecure/auth', {
        locale: this.config.locale || 'tr',
        conversationId: callbackData.conversationId,
        paymentId: callbackData.paymentId,
        conversationData: callbackData.conversationData,
      });

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3DS completion failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * İade işlemi
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await this.sendRequest<IyzicoRefundResponse>('/payment/refund', {
        locale: this.config.locale || 'tr',
        conversationId: request.conversationId,
        paymentTransactionId: request.paymentId,
        price: request.price,
        currency: request.currency,
        ip: request.ip,
      });

      return {
        status: this.mapStatus(response.status),
        refundId: response.paymentTransactionId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Refund failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * İptal işlemi
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      const response = await this.sendRequest<IyzicoCancelResponse>('/payment/cancel', {
        locale: this.config.locale || 'tr',
        conversationId: request.conversationId,
        paymentId: request.paymentId,
        ip: request.ip,
      });

      return {
        status: this.mapStatus(response.status),
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Cancel failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Ödeme sorgulama
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await this.sendRequest<IyzicoPaymentResponse>('/payment/detail', {
        locale: this.config.locale || 'tr',
        paymentId: paymentId,
      });

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Get payment failed',
        rawResponse: error.response?.data,
      };
    }
  }

  async initCheckoutForm() {
    try {
      const response = await this.sendRequest<any>('/payment/checkoutform/initialize', {
        locale: this.config.locale || 'tr',
      });

      return {
        status: this.mapStatus(response.status),
        checkoutFormContent: response.checkoutFormContent,
        paymentPageUrl: response.paymentPageUrl,
        token: response.token,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Checkout form initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  async retrieveCheckoutForm(token: string) {
    try {
      const response = await this.sendRequest<any>('/payment/checkoutform/retrieve', {
        locale: this.config.locale || 'tr',
        token: token,
      });

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Retrieve checkout form failed',
        rawResponse: error.response?.data,
      };
    }
  }
}
