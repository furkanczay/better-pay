# Better Pay

[![npm version](https://badge.fury.io/js/better-pay.svg)](https://badge.fury.io/js/better-pay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Türkiye'deki tüm ödeme altyapılarını entegre edebilen unified payment gateway kütüphanesi.

## Özellikler

- 🚀 **TypeScript ile Yazılmış** - Tam tip güvenliği ve IntelliSense desteği
- 🔌 **Framework Agnostic** - Node.js, Next.js, Express ve diğer tüm JavaScript framework'leri ile uyumlu
- 🏦 **Çoklu Provider Desteği** - Birden fazla ödeme sağlayıcısını aynı API ile yönetin
- 🎯 **Tutarlı API** - Tüm provider'lar için aynı interface
- 📦 **Hafif** - Minimal bağımlılık (sadece axios)
- 🛡️ **Güvenli** - API key ve secret key şifreleme

## Desteklenen Ödeme Sağlayıcıları

- ✅ **İyzico** - Tam destek (V2 Authorization)
- ✅ **PayTR** - Tam destek
- 🔜 **Shopier** - Planlanan
- 🔜 **PayU** - Planlanan
- 🔜 **Stripe Turkey** - Planlanan

## Kurulum

```bash
npm install better-pay
# veya
yarn add better-pay
# veya
pnpm add better-pay
```

## Hızlı Başlangıç

### 🎯 Önerilen Yöntem: Config-Based

```typescript
import { BetterPay, ProviderType } from 'better-pay';

// 1. Config dosyası oluşturun
const paymentConfig = {
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: 'https://sandbox-api.iyzipay.com',
      },
    },
    paytr: {
      enabled: false, // İsteğe bağlı - Kullanmak için true yapın
      config: {
        apiKey: process.env.PAYTR_MERCHANT_KEY!,
        secretKey: process.env.PAYTR_SECRET_KEY!,
        merchantId: process.env.PAYTR_MERCHANT_ID!,
        merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
        baseUrl: 'https://www.paytr.com',
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
};

// 2. BetterPay'i başlatın
const betterPay = new BetterPay(paymentConfig);

// 3. Ödeme yapın
const result = await betterPay.createPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  basketId: 'B67832',
  paymentCard: {
    cardHolderName: 'John Doe',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '2030',
    cvc: '123',
  },
  buyer: {
    id: 'BY789',
    name: 'John',
    surname: 'Doe',
    email: 'email@email.com',
    identityNumber: '11111111110',
    registrationAddress: 'Address',
    city: 'Istanbul',
    country: 'Turkey',
    ip: '85.34.78.112',
  },
  shippingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  basketItems: [
    {
      id: 'BI101',
      name: 'Product 1',
      category1: 'Category',
      itemType: BasketItemType.PHYSICAL,
      price: '100.00',
    },
  ],
});

if (result.status === 'success') {
  console.log('Ödeme başarılı:', result.paymentId);
} else {
  console.error('Ödeme hatası:', result.errorMessage);
}

// 4. İsteğe bağlı: Belirli bir provider kullanın
await betterPay.use(ProviderType.PAYTR).createPayment({ ... });
```

### 📦 Alternatif: Direct Provider Kullanımı

```typescript
import { Iyzico } from 'better-pay';

const iyzico = new Iyzico({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  baseUrl: 'https://sandbox-api.iyzipay.com',
});

const result = await iyzico.createPayment({ ... });
```

**Not:** Config-based yaklaşım önerilir çünkü:
- ✅ Birden fazla provider'ı tek yerden yönetebilirsiniz
- ✅ Provider'lar arası kolayca geçiş yapabilirsiniz
- ✅ Ortam değişkenlerine göre provider değiştirebilirsiniz
- ✅ Daha temiz ve maintainable kod

### 3D Secure Ödeme

```typescript
// 3D Secure işlemini başlat
const threeDSResult = await iyzico.initThreeDSPayment({
  // Aynı parametreler + callbackUrl
  callbackUrl: 'https://your-site.com/payment/callback',
  // ... diğer parametreler
});

if (threeDSResult.status === 'success' && threeDSResult.threeDSHtmlContent) {
  // HTML içeriğini kullanıcıya göster
  // Bu, banka 3D Secure sayfasına yönlendirir
  return threeDSResult.threeDSHtmlContent;
}

// Callback'ten sonra ödemeyi tamamla
const finalResult = await iyzico.completeThreeDSPayment(callbackData);
```

### Diğer İşlemler

```typescript
// Ödeme sorgulama
const payment = await iyzico.getPayment('payment-id');

// İade
const refund = await iyzico.refund({
  paymentId: 'payment-id',
  price: '50.00',
  currency: Currency.TRY,
  ip: '85.34.78.112',
});

// İptal
const cancel = await iyzico.cancel({
  paymentId: 'payment-id',
  ip: '85.34.78.112',
});
```

## TypeScript Desteği

Better Pay, tam TypeScript desteği sunar:

```typescript
import type { PaymentRequest, PaymentResponse, PaymentStatus } from 'better-pay';

const request: PaymentRequest = {
  // TypeScript otomatik olarak tüm gerekli alanları gösterir
  price: '100.00',
  // ...
};

const result: PaymentResponse = await provider.createPayment(request);

if (result.status === PaymentStatus.SUCCESS) {
  // TypeScript bilir ki result.paymentId var
  console.log(result.paymentId);
}
```

## Framework Örnekleri

### Next.js (App Router)

```typescript
// app/api/payment/route.ts
import { Iyzico } from 'better-pay';
import { NextRequest, NextResponse } from 'next/server';

const iyzico = new Iyzico({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  baseUrl: process.env.IYZICO_BASE_URL!,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await iyzico.createPayment(body);
  return NextResponse.json(result);
}
```

### Express.js

```typescript
import express from 'express';
import { Iyzico } from 'better-pay';

const app = express();
const iyzico = new Iyzico({ /* config */ });

app.post('/payment', async (req, res) => {
  const result = await iyzico.createPayment(req.body);
  res.json(result);
});
```

## API Dokümantasyonu

Detaylı API dokümantasyonu için: [Dokümantasyon Sitesi]

### Temel Metodlar

Tüm provider'lar aşağıdaki metodları uygular:

- `createPayment(request)` - Direkt ödeme oluştur
- `initThreeDSPayment(request)` - 3D Secure ödeme başlat
- `completeThreeDSPayment(callbackData)` - 3D Secure ödeme tamamla
- `refund(request)` - İade işlemi
- `cancel(request)` - İptal işlemi
- `getPayment(paymentId)` - Ödeme sorgulama

### Tipler ve Enum'lar

```typescript
enum PaymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

enum BasketItemType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}
```

## Test

```bash
# Testleri çalıştır
pnpm test

# Test UI ile çalıştır
pnpm test:ui

# Build
pnpm build
```

## Katkıda Bulunma

Better Pay açık kaynak bir projedir. Katkılarınızı bekliyoruz!

1. Repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Yeni Provider Ekleme

Yeni bir provider eklemek için:

1. `src/providers/[provider-name]/` klasörü oluşturun
2. `PaymentProvider` abstract sınıfını extend edin
3. Tüm metodları implement edin
4. Testler yazın
5. Dokümantasyon ekleyin

## Lisans

MIT

## Destek

- 📖 [Dokümantasyon]
- 🐛 [Issues](https://github.com/furkanczay/better-pay/issues)
- 💬 [Discussions](https://github.com/furkanczay/better-pay/discussions)

## Roadmap

- [x] İyzico entegrasyonu
- [x] PayTR entegrasyonu
- [ ] Shopier entegrasyonu
- [ ] PayU entegrasyonu
- [ ] Stripe Turkey entegrasyonu
- [ ] Webhook desteği
- [ ] Recurring (tekrarlayan) ödemeler
- [ ] Taksit hesaplama
- [ ] Daha fazla test coverage

---

Made with ❤️ for Turkish developers
