// tests/api/payments.webhook.test.ts
import handler, { config as apiConfig } from '@/pages/api/webhooks/payment';
import httpMocks from 'node-mocks-http';

describe('API: /api/webhooks/payment', () => {
  test('exports the correct Next.js config (bodyParser disabled)', () => {
    expect((apiConfig as any)?.api?.bodyParser).toBe(false);
  });

  test('rejects non-POST methods', async () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();
    // @ts-expect-error Next handler signature
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('accepts POST when Stripe not configured (dev path)', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { 'stripe-signature': '' },
    });
    const res = httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
    // @ts-expect-error Next handler signature
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    const json = res._getJSONData();
    expect(json).toEqual({ received: true });
  });
});
