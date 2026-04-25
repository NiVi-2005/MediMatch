const mongoose = require('mongoose')

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Analgesic', 'Antibiotic', 'Antiviral', 'Antifungal', 'Antacid',
             'Antihistamine', 'Vitamin/Supplement', 'Cardiac', 'Diabetic', 'Respiratory', 'Other'],
      default: 'Other',
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    sideEffects: {
      type: String,
      trim: true,
    },
    // Which pharmacy added this medicine (admin context)
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Text index for search
medicineSchema.index({ name: 'text', genericName: 'text', category: 'text' })

module.exports = mongoose.model('Medicine', medicineSchema)
