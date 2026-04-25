const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'strips', 'bottles', 'injections'],
      default: 'tablets',
    },
    price: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    // Low stock threshold - alert when quantity goes below this
    threshold: {
      type: Number,
      default: 10,
    },
    location: {
      type: String,
      trim: true,
    },
    // High demand flag
    isHighDemand: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Inventory', inventorySchema)
