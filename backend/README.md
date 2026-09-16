# Dairy Feed E-Commerce Backend

A complete Node.js + Express + MongoDB backend for a dairy/cattle feed e-commerce platform, with four roles (admin, manager, customer, delivery), full order lifecycle, inventory tracking, notifications, reviews, and reports.

## 1. Tech Stack

Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, Socket.IO, CORS, dotenv. Media storage is pluggable — local disk, Cloudinary, or S3-compatible — selected by environment variable.

## 2. Setup

```bash
npm install
```

Copy `.env` and adjust as needed:

```
PORT=8000
MONGO_URI=mongodb://localhost:27017/DigitalDairyFeed
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

STORAGE_DRIVER=local
BASE_URL=http://localhost:8000
```

See §10 for the media storage options.

Run:

```bash
npm run dev     # nodemon
npm start       # plain node
```

The server must be started from the project root (`uploads/` paths are relative to `process.cwd()`).

Create your first admin manually, since there is no public admin-signup route:

```js
// one-off script or mongo shell
db.users.insertOne({
  name: "Admin",
  email: "admin@dairyfeed.com",
  phone: "9999999999",
  password: "<bcrypt-hashed password>",
  role: "admin",
  status: "approved"
})
```
Or temporarily register through `/api/auth/register` and change that user's `role` to `admin` directly in the database.

## 3. Folder Structure

Feature-based ("module") structure — each business feature owns its schema, controller, and routes together, which is easier to navigate than spreading them across three global folders:

```
backend/
├── config/db.js
├── middleware/
│   ├── auth.middleware.js         (protect - verifies JWT)
│   ├── role.middleware.js         (authorize - RBAC)
│   ├── optionalAuth.middleware.js (attaches req.user if a token is present, else continues)
│   ├── upload.middleware.js       (profile image uploads)
│   └── error.middleware.js        (notFound + centralized errorHandler)
├── modules/
│   ├── auth/        register, login
│   ├── user/         profile, password, profile image
│   ├── product/      catalog, media, search/filter, reviews routes
│   ├── category/
│   ├── cart/
│   ├── order/        checkout, status flow, delivery assignment
│   ├── payment/       COD + mock online verification
│   ├── delivery/      delivery-person dashboard & status updates
│   ├── admin/         customer/delivery management, dashboard, reports
│   ├── inventory/
│   ├── notification/
│   ├── review/
│   └── dashboard/     role-specific dashboard summaries
├── utils/
│   ├── response.js       success()/error() helpers, consistent API shape
│   ├── asyncHandler.js   wraps controllers, forwards errors to errorHandler
│   ├── generateToken.js
│   ├── generateId.js     human-readable IDs (ORD-XXXX etc.)
│   ├── notify.js         notifyUser() / notifyAdmins()
│   └── inventoryHelper.js adjustStock() shared by order create/cancel
├── utils/storage/                  media storage layer (see section 10)
│   ├── index.js                    picks the provider from env + validates config
│   ├── local.provider.js
│   ├── cloudinary.provider.js
│   └── s3.provider.js
├── uploads/                        used only when STORAGE_DRIVER=local
└── server.js
```

Each module's own folder holds its `*.schema.js`, `*.controller.js`, `*.routes.js` — nothing about a feature is scattered elsewhere.

## 4. Roles & Status

`role`: `admin`, `manager`, `customer`, `delivery`
`status`: `pending`, `approved`, `blocked`, `rejected`

- Customer self-registration is set to `approved` immediately (self-serve signup); admin can still block/reject afterward.
- Delivery accounts are created only by an admin (`POST /api/admin/delivery`) and are `approved` by default; you can flip a delivery person to `pending`/`blocked` any time via `PUT /api/admin/delivery/:id/status`, which immediately blocks their login.
- `manager` has the same permissions as `admin` on products/categories/inventory, but not on customer/delivery management, order assignment, or reports (see route files for exact split).

## 5. Order & Delivery State Machines

Order: `Pending → Confirmed → Processing → Packed → Assigned → Out for Delivery → Delivered`, or `Cancelled` from any state before `Delivered`. Each transition is validated server-side — you cannot skip a step.

Delivery record (separate from order status, one per assignment): `Assigned → Picked Up → Out for Delivery → Delivered`, or `Failed Delivery` at any point. Reaching `Out for Delivery` / `Delivered` on the delivery record automatically syncs the parent order's `orderStatus`, and a `Delivered` COD order automatically flips `paymentStatus` to `Paid`.

Stock is decremented when an order is placed and restored on cancellation, via `utils/inventoryHelper.js`, which also fires a low-stock notification to all admins when a product's `Inventory.currentStock` drops to or below `minimumStock`.

## 6. Payments

`COD` and `Online` are supported. COD starts `Pending` and turns `Paid` automatically on delivery. Online payment is a simplified mock (`POST /api/payments/:orderId/verify`) — swap the `verifyOnlinePayment` controller for a real Razorpay/Stripe webhook when you're ready to go live; the `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` env vars are left out until then, since a fake key would silently break rather than help you.

## 7. API Reference

All responses follow `{ success, message, data }` (or `{ success, message, errors }` on validation failures).

### Auth — `/api/auth`
```
POST   /register
POST   /login
```

### Users — `/api/users` (auth required)
```
GET    /profile
PUT    /profile
PUT    /change-password
POST   /profile/image        multipart field: profileImage
```

### Products — `/api/products`
```
GET    /                     ?search=&category=&minPrice=&maxPrice=&minWeight=&maxWeight=&sort=price_asc|price_desc|newest|popularity&lang=en|ta&page=&limit=
GET    /:id                  ?lang=en|ta
POST   /                     admin, manager — multipart fields: images[], videos[]
PUT    /:id                  admin, manager
DELETE /:id                  admin (soft delete)
PUT    /:id/toggle-availability   admin, manager
GET    /:id/reviews
POST   /:id/reviews          customer — body: { orderId, rating, comment }
```

### Categories — `/api/categories`
```
GET    /
POST   /     admin, manager
PUT    /:id  admin, manager
DELETE /:id  admin
```

### Cart — `/api/cart` (customer)
```
GET    /
POST   /add            { productId, quantity }
PUT    /update         { productId, quantity }   (quantity 0 removes the item)
DELETE /remove/:productId
DELETE /clear
```

### Orders — `/api/orders`
```
POST   /                customer — { shippingAddress, paymentMethod }
GET    /my-orders       customer
GET    /:id             customer (own), delivery (assigned), admin
PUT    /:id/cancel      customer — only while Pending/Confirmed
```

### Payments — `/api/payments`
```
GET    /                    admin — ?status=
GET    /:orderId
POST   /:orderId/verify     customer — { transactionId }
PUT    /:id/status          admin
```

### Delivery — `/api/delivery` (role: delivery)
```
GET    /dashboard
GET    /orders               ?status=
GET    /orders/:id
PUT    /orders/:id/status    { status, deliveryNotes }
```

### Admin — `/api/admin` (role: admin)
```
GET    /dashboard
GET    /customers                     ?search=&status=
GET    /customers/:id
PUT    /customers/:id/status          { status }
GET    /delivery                      ?status=
POST   /delivery                      { name, email, phone, password, address }
PUT    /delivery/:id/status           { status }
GET    /delivery/:id/orders
GET    /orders                        ?status=&page=&limit=
GET    /orders/:id
PUT    /orders/:id/status             { status } — sequential transition or "Cancelled"
PUT    /orders/:id/assign-delivery    { deliveryPersonId }
GET    /reports/sales                 ?period=daily|weekly|monthly|yearly
GET    /reports/products              ?limit=
GET    /reports/customers
GET    /reports/delivery
```

### Inventory — `/api/inventory` (admin, manager)
```
GET    /
GET    /low-stock
PUT    /:productId    { currentStock, minimumStock }
```

### Notifications — `/api/notifications` (auth required)
```
GET    /
PUT    /:id/read
PUT    /read-all
```

### Reviews — `/api/reviews` (auth required)
```
PUT    /:id     own review only — { rating, comment }
DELETE /:id     own review, or any review if admin
```

### Dashboard — `/api/dashboard`
```
GET    /admin      admin
GET    /customer   customer
GET    /delivery   delivery
```

## 8. Security Notes

- Passwords are hashed with bcryptjs and never returned in responses (`select: false` on the schema field, plus a `toSafeObject()` helper).
- Every protected route runs `protect` (valid JWT + account not blocked/rejected) and, where relevant, `authorize(...roles)`.
- Money fields (`subtotal`, `deliveryCharge`, `totalAmount`, stock deductions) are always calculated server-side from the database, never trusted from the request body.
- Centralized `errorHandler` normalizes Mongoose `CastError`, duplicate-key (`11000`), and `ValidationError` into consistent JSON responses.

## 9. What's intentionally left out

- Real-time tracking is not wired to Socket.IO — the order/delivery status endpoints are built so a Socket.IO layer can emit on the same state changes later without any restructuring.
- Video `duration` and `thumbnail` are only populated on Cloudinary. Local and S3 uploads return `0` and `""` — extracting them would need ffmpeg on the server.
- Razorpay integration is mocked (see §6) rather than half-wired with placeholder keys that wouldn't actually work.


## 10. Media Storage

Where uploaded images and videos go is decided entirely by `.env` — no code changes needed to switch.

```
STORAGE_DRIVER=local        # or: cloud
CLOUD_PROVIDER=cloudinary   # used only when STORAGE_DRIVER=cloud. Options: cloudinary, s3
```

### `STORAGE_DRIVER=local`

Files are written to `uploads/` and served by this server through `app.use("/uploads", express.static(...))`.

```
BASE_URL=http://localhost:8000
```

`BASE_URL` is what gets prefixed onto stored URLs, so set it to your real domain in production. Start the server from the project root — upload paths resolve against `process.cwd()`.

### `STORAGE_DRIVER=cloud` + `CLOUD_PROVIDER=cloudinary`

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=dairyfeed
```

### `STORAGE_DRIVER=cloud` + `CLOUD_PROVIDER=s3`

Works with AWS S3 and any S3-compatible service (DigitalOcean Spaces, Cloudflare R2, MinIO).

```bash
npm install @aws-sdk/client-s3
```

```
S3_BUCKET=
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FOLDER=dairyfeed
S3_ENDPOINT=              # only for non-AWS providers
S3_PUBLIC_URL=            # only if serving through a CDN or custom domain
```

The bucket must allow public reads on the uploaded objects, otherwise the returned URLs won't load in a browser.

### How it fits together

```
modules/*/upload.middleware.js   Multer keeps the file in memory (no disk writes)
            ↓
utils/storage/index.js           reads env, picks a provider, validates config
            ↓
local.provider.js | cloudinary.provider.js | s3.provider.js
```

Every provider returns the same shape, so controllers never know which one is active:

```js
{ url, publicId, duration, thumbnail }
```

`url` is a **full absolute URL in every mode**, so the frontend uses `product.images[0].url` directly and never prefixes the API host. That is what makes switching drivers invisible to React.

`publicId` is what the delete path uses — a relative file path locally, a Cloudinary public ID, or an S3 object key.

### Adding another provider

Create `utils/storage/yourprovider.provider.js` exporting `save(file, folder, resourceType)` and `remove(publicId, resourceType)`, then register it in the `CLOUD_PROVIDERS` map in `utils/storage/index.js`. Nothing else changes.

### Config is validated at boot

If `STORAGE_DRIVER`/`CLOUD_PROVIDER` is misspelled or credentials for the selected provider are missing, the server prints the problem and exits instead of failing on the first upload:

```
Storage configuration error: CLOUD_PROVIDER="s3" needs these env variables: S3_REGION, S3_ACCESS_KEY_ID
```

On a healthy boot it confirms the active driver:

```
Server running on http://localhost:8000
Media storage driver: cloud:cloudinary
```

### Migrating existing records

Products uploaded before this change hold relative paths like `/uploads/images/abc.png` in MongoDB. Switching drivers does not rewrite them. Either re-upload that media, or run a one-off script that uploads each local file to the new provider and updates `url` + `publicId` on the document.
