# Payment Flow

These examples demonstrate initiating sandbox payments and handling provider callbacks.

## Initiate Payment

```
# JazzCash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123","amount":100,"method":"jazzcash"}'

# Easypaisa
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123","amount":100,"method":"easypaisa"}'

# Card / International
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123","amount":100,"method":"card"}'
```

## Webhook Callback

```
# Sample JazzCash webhook
curl -X POST "http://localhost:3000/api/payments/webhook?provider=jazzcash" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123","amount":100,"paymentId":"abc","signature":"hash"}'
```

Replace parameters with sandbox values from each provider.
