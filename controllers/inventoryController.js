const Inventory = require('../models/Inventory')

// Helper: get pharmacy filter for admin
const getPharmacyFilter = (user) => {
  if (user.role === 'admin') return { pharmacyId: user.pharmacyId || '000000000000000000000000' }
  return {}
}

// @route   GET /api/inventory
// @access  Private (admin, superadmin)
const getAllInventory = async (req, res) => {
  try {
    const filter = getPharmacyFilter(req.user)
    const { search } = req.query
    if (search) filter.medicineName = { $regex: search, $options: 'i' }

    const inventory = await Inventory.find(filter)
      .populate('medicineId', 'name genericName requiresPrescription')
      .populate('pharmacyId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, count: inventory.length, inventory })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   GET /api/inventory/alerts/low-stock
// @access  Private (admin)
const getLowStock = async (req, res) => {
  try {
    const filter = getPharmacyFilter(req.user)

    // Get items where quantity is at or below threshold
    const allItems = await Inventory.find(filter)
    const items = allItems.filter(item => item.quantity <= (item.threshold || 10))

    res.status(200).json({ success: true, count: items.length, items })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   GET /api/inventory/alerts/high-demand
// @access  Private (admin)
const getHighDemand = async (req, res) => {
  try {
    const filter = { ...getPharmacyFilter(req.user), isHighDemand: true }
    const items = await Inventory.find(filter)
    res.status(200).json({ success: true, count: items.length, items })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('medicineId', 'name genericName')
      .populate('pharmacyId', 'name address')
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' })
    res.status(200).json({ success: true, item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   POST /api/inventory
// @access  Private (admin)
const createInventory = async (req, res) => {
  try {
    const { medicineId, medicineName, quantity, unit, price, expiryDate, threshold, location } = req.body

    if (!medicineName || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Medicine name and quantity are required' })
    }

    const data = {
      medicineId, medicineName, quantity: Number(quantity),
      unit, price: price ? Number(price) : undefined,
      expiryDate: expiryDate || undefined,
      threshold: threshold ? Number(threshold) : 10,
      location,
      addedBy: req.user._id,
    }

    if (req.user.pharmacyId) data.pharmacyId = req.user.pharmacyId

    const item = await Inventory.create(data)
    res.status(201).json({ success: true, message: 'Inventory item added', item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   PUT /api/inventory/:id
// @access  Private (admin)
const updateInventory = async (req, res) => {
  try {
    if (req.body.quantity !== undefined) req.body.quantity = Number(req.body.quantity)
    if (req.body.price !== undefined) req.body.price = Number(req.body.price)
    if (req.body.threshold !== undefined) req.body.threshold = Number(req.body.threshold)

    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' })
    res.status(200).json({ success: true, message: 'Inventory updated', item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route   DELETE /api/inventory/:id
// @access  Private (admin)
const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' })
    res.status(200).json({ success: true, message: 'Inventory item removed' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getAllInventory, getInventoryById, getLowStock, getHighDemand, createInventory, updateInventory, deleteInventory }
