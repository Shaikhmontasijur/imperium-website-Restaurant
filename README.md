# IMPERIUM Restaurant - Premium Web Application & Online Ordering System

A luxury, high-performance, fully responsive restaurant web application with direct online ordering engineered for **IMPERIUM Restaurant** in Qatar. Built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Zod** server-side verification.

---

## 1. Verified Business Details

- **Establishment Name**: IMPERIUM Restaurant
- **Phone / WhatsApp**: `+974 5105 3510`
- **Commercial Registration (CR) No**: `229987`
- **Location Coordinates**: `25.280512, 51.4850816` (Al Amir Street, Fereej Al Soudan / Al Rayyan, Qatar)
- **Timezone**: `Asia/Qatar` (UTC+3)
- **Cuisine**: Indian Royal Spices, Authentic Arabian Mandi & Charcoal Grills, Indo-Chinese & Fast Food
- **Currency**: `QAR` (Qatari Riyal)

---

## 2. Project Architecture & Phase 2 Readiness

```
resturent-website-demo/
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx              # Localized root layout, navbar, footer, cart drawer, mobile bar
│   │   ├── page.tsx                # Homepage (Hero, About, Signature, Menu, Gallery, Reviews, Hours & Map)
│   │   ├── checkout/
│   │   │   └── page.tsx            # Single-page checkout (Delivery/Pickup, Geolocation, Cash on Delivery)
│   │   ├── order/
│   │   │   └── [orderNumber]/
│   │   │       └── page.tsx        # Customer live order tracking status page
│   │   └── admin/
│   │       └── page.tsx            # Password-protected admin dashboard (order board, audio chime, menu toggle)
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts            # POST order creation (Server-side price verification, validation, DB storage)
│   │   │   └── [orderNumber]/
│   │   │       └── route.ts        # GET / PATCH order status
│   │   ├── admin/
│   │   │   └── login/
│   │   │       └── route.ts        # Admin authentication session route
│   │   └── menu/
│   │       └── route.ts            # GET / PATCH dish availability & prices
│   ├── sitemap.ts                  # Dynamic XML sitemap
│   ├── robots.ts                   # robots.txt configuration
│   ├── globals.css                 # Dark luxury theme, gold scrollbars, logical spacing
│   └── layout.tsx                  # Root HTML, Playfair/Inter fonts, Restaurant JSON-LD schema
├── components/
│   ├── imperium-logo.tsx           # Golden cloche SVG with star sparkle & serif wordmark
│   ├── navbar.tsx                  # Sticky navbar with Qatar live open badge & cart trigger
│   ├── hero.tsx                    # Full-bleed hero banner with dark gradient overlay & CTAs
│   ├── about.tsx                   # Brand story, 3 cuisine highlights, storefront photo
│   ├── signature-dishes.tsx        # Top 6 featured dishes with quick-add & customization
│   ├── menu-section.tsx            # Category tabs, sticky mobile category bar, search & filter
│   ├── dish-card.tsx               # Individual card with photo, price, sold-out states, stepper
│   ├── dish-options-modal.tsx      # Portion size, spice level, add-on choices
│   ├── cart-drawer.tsx             # Slide-in drawer with free delivery progress meter
│   ├── gallery.tsx                 # Masonry grid with full keyboard lightbox
│   ├── reviews-section.tsx         # Real Google reviews & 4.6 star aggregate score
│   ├── hours-location.tsx          # Real-time Qatar "Open Now / Closed" schedule & Google Maps embed
│   ├── footer.tsx                  # Logo, quick links, socials, phone, CR 229987, copyright
│   └── mobile-bottom-bar.tsx       # Sticky bottom bar with Call, WhatsApp and View Cart
├── config/
│   ├── business-config.json        # Single source of truth for opening hours, delivery fees, min orders, zones
│   └── menu-data.json              # Complete catalog: id, category, name_en, description_en, price, options, available
├── locales/
│   └── en.json                     # Comprehensive string dictionary (all UI, errors, admin labels, notifications)
├── lib/
│   ├── cart-store.ts               # Zustand store persisted with localStorage
│   ├── order-store.ts              # Robust order store with server-side price recalculation
│   ├── order-schema.ts             # Zod validation schema and Qatar phone regex (+974)
│   ├── whatsapp.ts                 # Formats rich WhatsApp order messages for wa.me link
│   ├── email.ts                    # Nodemailer / Resend email dispatcher template
│   ├── opening-hours.ts            # Real-time Asia/Qatar timezone status calculator
│   └── payment/
│       ├── types.ts                # Payment gateway interface abstraction
│       └── provider.ts             # Default Cash on Delivery + SkipCash Qatar stub
├── public/
│   └── images/                     # 20 high-resolution food, storefront, and interior photos
├── middleware.ts                   # Automatically forwards / to /en
├── tailwind.config.ts              # Luxury color tokens & logical utilities
└── next.config.mjs                 # Image optimization and security headers
```

---

## 3. How to Run Locally

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+ or pnpm or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in your browser
# http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run start
```

---

## 4. Environment Variables

Create a `.env.local` file in the root directory:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Required on Vercel | `""` | Supabase Project URL (`https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Required on Vercel | `""` | Supabase Service Role Key (secret server-only) |
| `ADMIN_PASSWORD` | Required | `imperium2026` | Password protecting the `/admin` kitchen dashboard |
| `RESTAURANT_NOTIFICATION_EMAIL` | Optional | `orders@imperiumqatar.com` | Email address where kitchen copies are sent |
| `RESEND_API_KEY` | Optional | `""` | Resend API key for live automated email dispatch |
| `SKIPCASH_CLIENT_KEY` | Optional | `""` | SkipCash Qatar merchant client key |
| `SKIPCASH_KEY_SECRET` | Optional | `""` | SkipCash Qatar secret key |
| `SKIPCASH_KEY_ID` | Optional | `""` | SkipCash Qatar key ID |

---

## 5. How to Set Up Supabase (5 Minutes)

To ensure orders and real-time menu toggles persist permanently across Vercel serverless deployments:

1. **Create a Free Project**:
   - Go to [database.new](https://database.new) or sign in to [Supabase](https://supabase.com).
   - Create a new project named `imperium-qatar` (choose `Middle East (Bahrain)` or `Frankfurt/London` region for lowest latency to Qatar).

2. **Execute Schema SQL**:
   - In your Supabase dashboard, click **SQL Editor** on the left navigation bar.
   - Click **New Query**, copy the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   - This creates both the `orders` and `menu_items` tables with indices and rate-limiting support.

3. **Execute Seed SQL**:
   - Click **New Query** again, copy the contents of [`supabase/seed.sql`](supabase/seed.sql), and click **Run**.
   - This seeds all 17 signature and menu items with exact IDs, English & Arabic descriptions, and options.

4. **Copy API Keys**:
   - In Supabase, go to **Project Settings** (gear icon) > **API**.
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`.
   - Under **Project API keys**, copy `service_role` (secret) -> `SUPABASE_SERVICE_ROLE_KEY`.

5. **Set Environment Variables on Vercel & Locally**:
   - Locally: Paste them into your `.env.local` file.
   - Vercel: Under **Project Settings > Environment Variables**, add both keys.

> **Graceful Fallback**: If Supabase credentials are ever missing or unreachable, the web application runs in offline resilience mode: orders are cleanly processed and forwarded directly to the customer's and restaurant's WhatsApp (`+974 5105 3510`), while the admin dashboard indicates "Offline Mode / Database Not Connected".

---

## 6. How to Deploy

### Option A: Deploy to Vercel (Recommended)
1. Push this repository to GitHub or GitLab.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository. Next.js 14 will be detected automatically.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret service key
   - `ADMIN_PASSWORD`: Your chosen secure admin password (default: `imperium2026`)
   - `RESEND_API_KEY`: *(Optional, if using automated emails)*
5. Click **Deploy**.

### Option B: Deploy to Netlify
1. Connect repository to [Netlify](https://netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `.next`
4. Add environment variables and deploy using the `@netlify/plugin-nextjs` adapter.

---

## 6. Client Confirmation & Placeholders List

The following items are marked with placeholders or default estimates and require final client confirmation before production domain launch:

1. **Restaurant Email Address**: `[ADD RESTAURANT EMAIL]` (Currently defaulting to `orders@imperiumqatar.com`).
2. **Exact Building / Zone Number**: `[ADD EXACT BUILDING / ZONE NUMBER]` (Location verified on Al Amir Street, Fereej Al Soudan / Al Rayyan; exact building/villa number to be added).
3. **Dish Prices in QAR**: All 18 dishes have realistic market estimates in `config/menu-data.json` and are marked with `[ADD PRICE - Estimated QAR xx]` for final client approval:
   - *Royal Chicken Dum Biryani*: Estimated QAR 24
   - *Nawab Beef Biryani*: Estimated QAR 28
   - *Spiced Egg Biryani*: Estimated QAR 18
   - *Imperium Mandi / Kabsa*: Estimated QAR 32
   - *Charcoal Grilled Half Chicken*: Estimated QAR 26
   - *Imperial BBQ Grilled Fish*: Estimated QAR 42
   - *Grilled Chicken on Spiced Rice*: Estimated QAR 30
   - *Black Pepper Beef Fry*: Estimated QAR 28
   - *Traditional Beef Curry*: Estimated QAR 26
   - *North Indian Kadai Chicken*: Estimated QAR 25
   - *Crispy Chicken 65*: Estimated QAR 22
   - *Chicken Manchurian*: Estimated QAR 24
   - *Wok-Tossed Shrimp Noodles*: Estimated QAR 28
   - *Double Chicken Cheese Burger*: Estimated QAR 24
   - *Gourmet Beef Burger*: Estimated QAR 22
   - *Charcoal Grilled Chicken Burger*: Estimated QAR 20
   - *Royal Mint Lime Mojito*: Estimated QAR 14
4. **Delivery Fee & Free Delivery Threshold**: Set to 10 QAR standard delivery, free delivery above 100 QAR.
5. **Minimum Order Amount**: Set to 30 QAR.
6. **Delivery Zones**: Standard Qatar zones included (`Al Rayyan`, `Fereej Al Soudan`, `Al Waab`, `Al Sadd`, `Madinat Khalifa`, `Ain Khaled`, `Al Aziziyah`, `Central Doha`).
7. **Online Payment Gateway**: Disabled by default as requested (Cash on Delivery and Pay at Counter are active). Ready to plug in SkipCash or MyFatoorah via environment variables.
