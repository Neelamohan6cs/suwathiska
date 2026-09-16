const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "Picked Up", "Out for Delivery", "Delivered", "Failed Delivery"],
      default: "Assigned",
    },
    assignedAt: Date,
    pickedUpAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
    deliveryNotes: String,
    rideStartedAt: Date,
    driverLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    route: {
      geometry: mongoose.Schema.Types.Mixed,
      distanceMeters: Number,
      durationSeconds: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
