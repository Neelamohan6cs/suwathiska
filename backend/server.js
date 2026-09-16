const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const connectDatabase = require("./config/db");
const { initSocket } = require("./config/socket");

const { notFound, errorHandler } = require("./middleware/error.middleware");
const { activeDriver } = require("./utils/storage");

const app = express();

connectDatabase();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Dairy Feed E-Commerce API is running" });
});

app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/users", require("./modules/user/user.routes"));
app.use("/api/products", require("./modules/product/product.routes"));
app.use("/api/categories", require("./modules/category/category.routes"));
app.use("/api/cart", require("./modules/cart/cart.routes"));
app.use("/api/orders", require("./modules/order/order.routes"));
app.use("/api/payments", require("./modules/payment/payment.routes"));
app.use("/api/delivery", require("./modules/delivery/delivery.routes"));
app.use("/api/admin", require("./modules/admin/admin.routes"));
app.use("/api/inventory", require("./modules/inventory/inventory.routes"));
app.use("/api/notifications", require("./modules/notification/notification.routes"));
app.use("/api/reviews", require("./modules/review/review.routes"));
app.use("/api/dashboard", require("./modules/dashboard/dashboard.routes"));
app.use("/api/geocode", require("./modules/geocode/geocode.routes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
app.set("io", io);

let storageDriver;

try {
  storageDriver = activeDriver();
} catch (error) {
  console.error(`Storage configuration error: ${error.message}`);
  process.exit(1);
}

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Media storage driver: ${storageDriver}`);
});
