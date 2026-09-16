# Suwasthika Dairy Feeds — E‑commerce Frontend

A React (Vite) frontend built against your existing Node/Express/MongoDB backend
(`dairy-feed-backend.zip`). Milk-blue, farmer-friendly storefront + separate
Admin / Manager / Delivery portals, matching the backend's real routes and
auth rules.

## Running it

```bash
npm install
cp .env.example .env   # edit if your backend runs somewhere other than localhost:8000
npm run dev
```

The backend must be running separately (`node server.js` in the backend folder)
on the URL set in `.env` (`VITE_API_URL`, `VITE_ASSET_URL`).

## Where things live

- `src/api/` — one file per backend module, calling the exact routes in your
  Express app (`/api/products`, `/api/orders`, `/api/admin/...`, etc).
- `src/context/` — Auth, Cart, Language (EN/TA), Toast.
- `src/layouts/` — Customer layout (header/footer) and one shared `PortalShell`
  used by Admin, Manager and Delivery (sidebar + topbar).
- `src/pages/{customer,auth,admin,manager,delivery,shared}/`
- `src/routes/AppRoutes.jsx` — the full route map.

## Points where the frontend had to adapt to the *actual* backend

The build prompt described an idealized backend. Your real backend differs in
a few places, so the frontend was adapted to match it (per the brief's own
rule: adapt the frontend, don't change the backend):

1. **No Socket.IO in the backend.** Order tracking and the notification bell
   use polling (every 15–30s) instead of websockets.
2. **Cart requires a logged-in customer** (`/api/cart` is
   `protect + authorize("customer")`). Guests can still browse, search, view
   products and add to a **local cart** (stored in `localStorage`). On login,
   that local cart is merged into the backend cart automatically.
3. **Single login endpoint for every role.** There's no separate
   `/api/auth/admin-login` etc. — `/admin/login`, `/manager/login` and
   `/delivery/login` all call the same `/api/auth/login` and check the
   returned `role`; a mismatched role is signed out immediately with an
   "Access denied" message.
4. **Manager has no order/customer access in the backend** (`admin.routes.js`
   is `authorize("admin")` only). The Manager portal therefore only exposes
   Products, Categories and Inventory — exactly what the backend authorizes.
5. **Products are localized server-side** (`GET /api/products?lang=en|ta`
   returns flat strings), but **Categories are not** — the category API
   always returns `{ en, ta }` objects, so the frontend localizes those
   client-side.
6. **Product `category` is a fixed enum** (`cattle_feed`, `calf_feed`,
   `mineral_mixture`, `silage`, `fodder`, `feed_supplement`) on the Product
   model, separate from the admin-manageable `Category` collection (used for
   the storefront's "Shop by need" tiles/marketing). Filtering uses the enum
   since that's what `GET /api/products?category=` actually accepts.
7. **No real payment gateway.** `POST /api/payments/:orderId/verify` is a
   manual "mark as paid" endpoint, so the Order Success page offers a clearly
   labeled simulated payment step for Online orders — no card details are
   collected or transmitted anywhere.
8. **Order vs. Delivery IDs differ.** Admin updates orders by `Order._id`;
   the Delivery portal updates by `Delivery._id` (a separate record). The
   frontend keeps these straight per the actual route signatures.

## Login for testing

Use whatever admin/manager/delivery accounts already exist in your database —
there's no seed data here. Customers can self-register from `/register`.
