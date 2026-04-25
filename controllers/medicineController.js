const Medicine = require('../models/Medicine')
const Inventory = require('../models/Inventory')
const Pharmacy = require('../models/Pharmacy')

// @route   GET /api/medicines
const getAllMedicines = async (req, res) => {
  try {
    const { search, category, requiresPrescription } = req.query
    const filter = { isActive: true }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }
    if (category) filter.category = category
    if (requiresPrescription !== undefined) filter.requiresPrescription = requiresPrescription === 'true'
    if (req.user.role === 'admin' && req.user.pharmacyId) filter.pharmacyId = req.user.pharmacyId
    const medicines = await Medicine.find(filter).sort({ name: 1 })
    res.status(200).json({ success: true, count: medicines.length, medicines })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

// @route   GET /api/medicines/search/nearby
// Supports lat/lng for distance-sorted results
const searchNearby = async (req, res) => {
  try {
    const { name, lat, lng } = req.query
    if (!name) return res.status(400).json({ success: false, message: 'Medicine name is required' })

    // Find the medicine
    const medicine = await Medicine.findOne({ name: { $regex: name, $options: 'i' }, isActive: true })

    if (!medicine) return res.status(200).json({ success: true, pharmacies: [] })

    // Find inventory with this medicine that has stock
    const inventoryItems = await Inventory.find({
      $or: [
        { medicineId: medicine._id },
        { medicineName: { $regex: name, $options: 'i' } },
      ],
      quantity: { $gt: 0 },
    }).populate('pharmacyId')

    // Build pharmacy map
    const pharmacyMap = new Map()
    for (const item of inventoryItems) {
      if (item.pharmacyId && !pharmacyMap.has(item.pharmacyId._id.toString())) {
        pharmacyMap.set(item.pharmacyId._id.toString(), {
          ...item.pharmacyId.toObject(),
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
        })
      }
    }

    let pharmacies = Array.from(pharmacyMap.values())

    // Fallback: return all active pharmacies
    if (pharmacies.length === 0) {
      const allPharmacies = await Pharmacy.find({ status: 'active' }).limit(10)
      pharmacies = allPharmacies.map(p => p.toObject())
    }

    // If user provided location, compute and sort by distance
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)

      const withDistance = pharmacies.map(ph => {
        const coords = ph.location?.coordinates
        if (coords && Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
          const phLat = coords[1]
          const phLng = coords[0]
          // Haversine formula
          const R = 6371
          const dLat = (phLat - userLat) * Math.PI / 180
          const dLon = (phLng - userLng) * Math.PI / 180
          const a = Math.sin(dLat/2)**2 + Math.cos(userLat*Math.PI/180) * Math.cos(phLat*Math.PI/180) * Math.sin(dLon/2)**2
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          return { ...ph, distanceKm: Math.round(dist * 10) / 10 }
        }
        return ph
      })

      // Sort: pharmacies with known distance first, then by distance
      withDistance.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })

      return res.status(200).json({ success: true, medicine, pharmacies: withDistance })
    }

    res.status(200).json({ success: true, medicine, pharmacies })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    res.status(200).json({ success: true, medicine })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

const createMedicine = async (req, res) => {
  try {
    const { name, genericName, category, manufacturer, dosage, requiresPrescription, description, sideEffects } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Medicine name is required' })
    const data = { name, genericName, category, manufacturer, dosage, requiresPrescription, description, sideEffects, addedBy: req.user._id }
    if (req.user.role === 'admin' && req.user.pharmacyId) data.pharmacyId = req.user.pharmacyId
    const medicine = await Medicine.create(data)
    res.status(201).json({ success: true, message: 'Medicine added successfully', medicine })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    res.status(200).json({ success: true, message: 'Medicine updated successfully', medicine })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id)
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' })
    res.status(200).json({ success: true, message: 'Medicine deleted successfully' })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
}

module.exports = { getAllMedicines, getMedicineById, searchNearby, createMedicine, updateMedicine, deleteMedicine }
