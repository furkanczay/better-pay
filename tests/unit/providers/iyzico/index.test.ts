import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Iyzico } from '../../../../src/providers/iyzico';
import { PaymentStatus } from '../../../../src/types';

describe('Iyzico Provider - Unit Tests', () => {
  let iyzico: Iyzico;

  beforeEach(() => {
    iyzico = new Iyzico({
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      baseUrl: 'https://sandbox-api.iyzipay.com',
      locale: 'tr',
    });
  });

  describe('binCheck', () => {
    it('should map successful response correctly', async () => {
      const mockResponse = {
        status: 'success',
        locale: 'tr',
        systemTime: 123456789,
        binNumber: '454360',
        cardType: 'CREDIT_CARD',
        cardAssociation: 'VISA',
        cardFamily: 'Maximum',
        bankName: 'Türkiye İş Bankası',
        bankCode: 64,
        commercial: 0,
      };

      // Mock sendRequest
      vi.spyOn(iyzico as any, 'sendRequest').mockResolvedValue(mockResponse);

      const result = await iyzico.binCheck('454360');

      expect(result).toEqual({
        binNumber: '454360',
        cardType: 'CREDIT_CARD',
        cardAssociation: 'VISA',
        cardFamily: 'Maximum',
        bankName: 'Türkiye İş Bankası',
        bankCode: 64,
        commercial: false,
        rawResponse: mockResponse,
      });
    });

    it('should throw error when status is failure', async () => {
      const mockResponse = {
        status: 'failure',
        errorMessage: 'BIN not found',
      };

      // Mock sendRequest
      vi.spyOn(iyzico as any, 'sendRequest').mockResolvedValue(mockResponse);

      await expect(iyzico.binCheck('000000')).rejects.toThrow('BIN not found');
    });
  });

  describe('mapStatus', () => {
    it('should map success to PaymentStatus.SUCCESS', () => {
      const mapStatus = (iyzico as any).mapStatus.bind(iyzico);
      expect(mapStatus('success')).toBe(PaymentStatus.SUCCESS);
    });

    it('should map failure to PaymentStatus.FAILURE', () => {
      const mapStatus = (iyzico as any).mapStatus.bind(iyzico);
      expect(mapStatus('failure')).toBe(PaymentStatus.FAILURE);
    });

    it('should map unknown status to PaymentStatus.PENDING', () => {
      const mapStatus = (iyzico as any).mapStatus.bind(iyzico);
      expect(mapStatus('unknown')).toBe(PaymentStatus.PENDING);
    });
  });
});
