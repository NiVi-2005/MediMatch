const Pharmacy = require('../models/Pharmacy')

// @route   GET /api/pharmacies
// @access  Private
const getAllPharmacies = async (req, res) => {
  try {
    const { search, status, city } = req.query
    const filter = {}

    if (search) filter.name = { $regex: search, $options: 'i' }
    if (status) filter.status = status
    if (city) filter.city = { $regex: city, $options: 'i' }

    const pharmacies = await Pharmacy.find(filter).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: pharmacies.length, pharmacies })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   GET /api/pharmacies/:id
// @access  Private
const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' })
    }
    res.status(200).json({ success: true, pharmacy })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   POST /api/pharmacies
// @access  Private (superadmin)
const createPharmacy = async (req, res) => {
  try {
    const { name, email, phone, address, city, licenseNumber, status, subscriptionDeadline } = req.body

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' })
    }

    const pharmacy = await Pharmacy.create({ name, email, phone, address, city, licenseNumber, status, subscriptionDeadline })
    res.status(201).json({ success: true, message: 'Pharmacy created successfully', pharmacy })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   PUT /api/pharmacies/:id
// @access  Private (superadmin)
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' })
    }
    res.status(200).json({ success: true, message: 'Pharmacy updated successfully', pharmacy })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   DELETE /api/pharmacies/:id
// @access  Private (superadmin)
const deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id)
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' })
    }
    res.status(200).json({ success: true, message: 'Pharmacy deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getAllPharmacies, getPharmacyById, createPharmacy, updatePharmacy, deletePharmacy }
