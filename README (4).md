# ShopKart

ShopKart is a full-stack e-commerce assignment built with React, Vite, Node.js, Express, and MongoDB. It includes customer authentication, product browsing, a wishlist, a persistent shopping cart, checkout with Razorpay, and order history.

## Features

- Customer registration and login using bcrypt password hashing and JWT authentication stored in an HTTP-only cookie.
- Product catalogue with search, category filtering, sorting by price, stock information, and product details.
- User-specific wishlist and cart stored in MongoDB.
- Cart quantity validation against the product's available stock.
- Checkout with shipping details and Razorpay order creation.
- Server-side Razorpay signature verification before marking an order as placed.
- Order history and individual order details.
- Seed data for six sample products.

## Tech stack

**Frontend:** React, React Router, Vite, Axios, CSS  
**Backend:** Node.js, Express, Mongoose, MongoDB, bcrypt, JSON Web Tokens, cookie-parser  
**Payments:** Razorpay Checkout (test mode recommended for local development)

## Project structure

```text
ShopKart/
├── backend/
│   ├── controllers/       # Auth, products, cart, wishlist, and orders logic
│   ├── middlewares/       # JWT-cookie authentication middleware
│   ├── models/            # Customer, Product, and Order schemas
│   ├── routes/            # Express API routes
│   ├── utils/             # JWT generation helper
│   ├── .env.example       # Backend environment-variable template
│   ├── index.js           # Express server and MongoDB connection
│   ├── seed.js            # Sample product data
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, product card, protected route
    │   ├── context/       # Shared cart state
    │   ├── pages/         # Auth, home, catalogue, cart, checkout, orders
    │   ├── services/      # Axios API client
    │   ├── App.jsx        # Routes and session restoration
    │   └── styles.css
    ├── vite.config.js     # Local API proxy
    └── package.json
```

## Prerequisites

Install the following before running the application:

- Node.js and npm (Node.js 20.19+ is a good starting point for the dependencies in this repository).
- A MongoDB database, either a local MongoDB server or a MongoDB Atlas cluster.
- Razorpay test API keys to exercise the checkout flow. Browsing the store and using cart/wishlist features do not require Razorpay keys.

## Setup guide

Run commands from the repository root unless a step says otherwise. The frontend and backend run as separate processes, so keep each one in its own terminal.

### 1. Get the code

```bash
git clone https://github.com/divyam-r25/ShopKart.git
cd ShopKart
```

### 2. Configure the backend

```bash
cd backend
npm ci
```

Create a local `.env` file by copying the example:

**macOS/Linux**

```bash
cp .env.example .env
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and set the values:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=3000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

Notes:

- For local MongoDB, make sure the MongoDB service is running. For Atlas, replace `MONGO_URI` with your cluster connection string and make sure your IP/network access is configured.
- Replace `JWT_SECRET` with a unique, private random value. Do not commit `.env` or real secrets to GitHub.
- For checkout, replace the Razorpay placeholders with your **test-mode** key ID and key secret. Keep the key secret only in the backend environment; do not add it to frontend variables.
- `CLIENT_URL` should match the origin where the frontend is running. The local default is `http://localhost:5173`.

### 3. Add sample products

From the `backend` directory, run:

```bash
npm run seed
```

This inserts the six sample products used for development. **Important:** `backend/seed.js` currently runs `Product.deleteMany({})` before inserting them, so it deletes all existing product documents in the database selected by `MONGO_URI`. Use this command only with a development database whose product collection you are comfortable replacing.

### 4. Start the backend API

In the `backend` directory:

```bash
npm run dev
```

The API starts on `http://localhost:3000` by default. Open `http://localhost:3000/` to confirm that it responds with a message indicating that the ShopKart API is running.

To run without watch mode, use `npm start` instead.

### 5. Start the frontend

Open a **second terminal**, return to the repository root, and run:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

For local development, you normally do **not** need a frontend `.env` file: `frontend/vite.config.js` proxies `/customers`, `/products`, `/wishlist`, `/cart`, and `/orders` requests to `http://localhost:3000`. The Axios client uses `/` as its default API base URL.

If the frontend and API are deployed separately, configure `VITE_API_URL` for the frontend build to point to the backend API URL, and set the backend's `CLIENT_URL` to the exact deployed frontend origin. Production cookies are configured as `Secure` and `SameSite=None`, so production use requires HTTPS. Make sure the deployed backend also has its own valid `MONGO_URI`, `JWT_SECRET`, and Razorpay credentials.

## First run checklist

1. Confirm MongoDB is running and `MONGO_URI` points to the intended database.
2. Run `npm run seed` once if you need the demo catalogue.
3. Start the backend and verify `http://localhost:3000/` responds.
4. Start Vite and open `http://localhost:5173`.
5. Register an account, then log in.
6. Browse products, add items to the cart or wishlist, and confirm that these features work for the signed-in user.
7. To test checkout, configure valid Razorpay **test** keys in `backend/.env`, add items to the cart, and complete the Razorpay test flow.

## API overview

All endpoints are mounted on the backend at `http://localhost:3000` during local development. Protected endpoints expect the login cookie to be sent by the browser.

| Method | Endpoint | Purpose | Auth required |
|---|---|---|---|
| `GET` | `/` | API health message | No |
| `POST` | `/customers/register` | Register a customer | No |
| `POST` | `/customers/login` | Log in and set the auth cookie | No |
| `GET` | `/customers/me` | Get the current customer | Yes |
| `POST` | `/customers/logout` | Clear the auth cookie | No |
| `GET` | `/products` | List products; supports `search`, `category`, and `sort` query parameters | No |
| `GET` | `/products/:id` | Get a product by ID | No |
| `POST` | `/products` | Create a product | **Currently not protected** |
| `GET` | `/wishlist` | Get the signed-in customer's wishlist | Yes |
| `POST` | `/wishlist/:productId` | Add a product to the wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove a product from the wishlist | Yes |
| `GET` | `/cart` | Get the signed-in customer's cart | Yes |
| `POST` | `/cart/:productId` | Add a product/increase quantity | Yes |
| `PATCH` | `/cart/:productId` | Set a cart item's quantity | Yes |
| `DELETE` | `/cart/:productId` | Remove a cart item | Yes |
| `POST` | `/orders/create-payment-order` | Create a ShopKart order and Razorpay payment order | Yes |
| `POST` | `/orders/verify-payment` | Verify Razorpay payment signature and place the order | Yes |
| `GET` | `/orders` | List the signed-in customer's orders | Yes |
| `GET` | `/orders/:id` | Get one order belonging to the signed-in customer | Yes |

Product sorting values are `price_asc` and `price_desc`; omit `sort` for newest-first ordering. For category filtering, use a category such as `Electronics`, `Fashion`, `Books`, or `Home`.

## Authentication and payments

- Login generates a JWT and sends it in an HTTP-only cookie. The frontend API client uses `withCredentials: true` so browser requests can include the cookie.
- Cart, wishlist, and order APIs use authentication middleware and derive the customer from the verified cookie, rather than trusting a user ID sent by the frontend.
- The backend calculates order totals from product prices stored in MongoDB. The frontend's payment callback is not treated as proof of payment; the backend verifies Razorpay's signature before marking the order `PAID` and `PLACED`.
- If a payment attempt fails, the checkout page keeps the cart contents and shows an error. An order created before payment may remain in `PENDING_PAYMENT`; the current code does not include a payment-failure cleanup/reconciliation job.

## Troubleshooting

**Products do not appear**

- Check that the backend is running and connected to MongoDB.
- Confirm that `MONGO_URI` is pointing at the expected database.
- Run `npm run seed` from `backend` if you need the sample catalogue; remember that the seed script replaces the product collection.

**Login or protected pages do not work**

- Check the browser's Network tab for failed `/customers/me` requests.
- Confirm that the frontend is using the local Vite proxy and that the backend is running on port `3000`.
- Check that the browser accepts cookies. For a deployed frontend/backend pair, verify `CLIENT_URL`, HTTPS, and the browser's cookie policy.

**Checkout cannot start**

- Confirm that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are valid Razorpay test credentials in `backend/.env`.
- Check backend logs for Razorpay or MongoDB errors and make sure the browser can load `https://checkout.razorpay.com/v1/checkout.js`.

**The backend exits immediately**

- Confirm that `JWT_SECRET` is set to a value other than the example placeholder.
- Check that MongoDB is reachable and `MONGO_URI` is valid.

## Current limitations / review notes

- **Product creation is not restricted:** `POST /products` currently has no authentication or admin authorization. It should be protected before the application is exposed publicly.
- **No automated test script is defined** in either package file. Validate registration/login, cart/wishlist, order creation, and payment verification manually before submitting or deploying.
- **Stock is checked but not reserved/decremented when an order is placed.** Concurrent purchases can therefore oversell a product; this needs transaction/stock management before real-world use.
- **Failed or abandoned payments can leave pending orders** in the database. A production flow should add payment status reconciliation and an order-expiry/cleanup policy.

## Available scripts

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Run the API with Node's watch mode |
| `npm start` | Run the API normally |
| `npm run seed` | Replace product data with the six demo products |

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `frontend/dist` |
| `npm run preview` | Preview the built frontend locally |

---

Built as a full-stack e-commerce assignment project.
