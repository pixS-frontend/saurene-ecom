# Saurene Fashion Store

React + Tailwind + Firebase + Vercel starter for the Saurene fashion e-commerce website.

## Included in v1

- Home page with hero, promo banner, random featured products, and Gram section.
- Collections with search and category filters.
- Product details with auto image rotation, size selection, size guide placeholders.
- Cart and wishlist.
- Authentication (email/password, Google, phone OTP) via Firebase Auth.
- Checkout with saved address fields, coupon support, free shipping, Razorpay flow.
- Order success page with invoice details and 7-8 working days delivery text.
- Account page with recent orders (local storage fallback + Firestore ready).
- Footer quick-link pages (privacy, sustainability, ethos, terms, shipping, contact, size guide).

## Project structure

- `src/` frontend app
- `api/` Vercel serverless functions for Razorpay

## Setup

1. Install Node.js 20+ and npm.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill values.
4. Run locally:

```bash
npm run dev
```

## Firebase setup

Create a Firebase project and enable:

- Authentication: Email/Password, Google, Phone
- Firestore database

Then fill all `VITE_FIREBASE_*` env vars.

## Razorpay setup

Set these variables:

- Frontend: `VITE_RAZORPAY_KEY_ID`
- Server: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

The frontend calls:

- `POST /api/create-order`
- `POST /api/verify-payment`

## Instagram Gram setup

Set these server environment variables:

- `INSTAGRAM_ACCESS_TOKEN` (Instagram Graph API user token)
- `INSTAGRAM_FEED_LIMIT` (optional, default `6`)

The frontend calls:

- `GET /api/instagram-feed`

If token is missing or API fails, the Gram section automatically shows fallback local images.

## Admin orders view

To open admin order dashboard, set:

- `VITE_ADMIN_EMAILS=email1@example.com,email2@example.com`
- `VITE_ADMIN_USERNAME=adminusername`
- `VITE_ADMIN_PASSWORD=adminpassword`

When one of these emails (or the admin username/password in fallback mode) logs in, navbar shows an `Admin` link to `/admin/orders`.

## Deploy on Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.
5. Connect your GoDaddy domain in Vercel and add DNS records shown by Vercel.

## Content updates you can do next

- Replace placeholder images from `src/data/products.js`.
- Add your brand logo image at `public/logo-saurene.png` to show it in navbar.
- Update quick-link placeholder text in `src/pages/InfoPage.jsx`.
- Replace contact/social placeholders in footer.
