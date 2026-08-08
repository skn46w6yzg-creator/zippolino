# ZIPPOLINO

## Order desk access

Set `VITE_ORDERS_PASSCODE` to protect the `#orders` kitchen view. This session-based client-side passcode is only a stopgap; replace it with real server-side authentication when the backend order API is connected.

Mobile-first ordering site for premium Dutch mini pancakes.

## Run locally

```bash
npm install
npm run dev
```

## Launch configuration

Copy `.env.example` to `.env` and add the live payment and order API endpoints. The storefront, product customisation, cart, guest checkout, test-order storage, kitchen order view, SEO metadata, analytics event hooks, and Vercel configuration are included.

- Storefront: `/`
- Order desk foundation: `/#orders`

Before accepting live orders, replace the placeholder address/hours, confirm prices/allergens, connect a payment provider, order database, transactional email service, and notification service.
