const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.schema");
const Order = require("../modules/order/order.schema");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinDeliveryRoom", async (orderId) => {
      try {
        if (!orderId) return;

        const order = await Order.findById(orderId).select("customer deliveryPerson");
        if (!order) return;

        const isAuthorized =
          ["admin", "manager"].includes(socket.user.role) ||
          (socket.user.role === "customer" && order.customer.toString() === socket.user._id.toString()) ||
          (socket.user.role === "delivery" &&
            order.deliveryPerson &&
            order.deliveryPerson.toString() === socket.user._id.toString());

        if (!isAuthorized) return;

        socket.join(`order:${orderId}`);
      } catch (err) {
        // invalid id or lookup failure - ignore the join request
      }
    });

    socket.on("leaveDeliveryRoom", (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO has not been initialized");
  return io;
};

module.exports = { initSocket, getIO };
