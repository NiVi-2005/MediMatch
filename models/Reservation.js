const mongoose = require('mongoose')

const reservationSchema = new mongoose.Schema(
  {
    // User who made the reservation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String },
    userEmail: { type: String },

    // Medicine details
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
    },

    // Pharmacy details
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    pharmacyName: { type: String },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'success', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },

    // Note from admin when updating status
    statusNote: { type: String },

    // Patient notes to pharmacy
    notes: { type: String },

    // Prescription
    hasPrescription: {
      type: Boolean,
      default: false,
    },
    prescriptionFile: {
      filename: String,
      originalName: String,
      mimetype: String,
      path: String,
      uploadedAt: Date,
    },

    // After reservation is marked success/completed, prescription is auto-deleted
    prescriptionDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Reservation', reservationSchema)
