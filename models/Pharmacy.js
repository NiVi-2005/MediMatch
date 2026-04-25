const mongoose = require('mongoose')

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pharmacy name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    // Admin user who manages this pharmacy
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subscriptionDeadline: {
      type: Date,
    },
  },
  { timestamps: true }
)

pharmacySchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Pharmacy', pharmacySchema)
