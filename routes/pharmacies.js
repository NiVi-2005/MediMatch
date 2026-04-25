const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const {
  getAllPharmacies, getPharmacyById, createPharmacy, updatePharmacy, deletePharmacy
} = require('../controllers/pharmacyController')

router.use(protect)

router.get('/', getAllPharmacies)
router.get('/:id', getPharmacyById)
router.post('/', authorize('superadmin'), createPharmacy)
router.put('/:id', authorize('superadmin'), updatePharmacy)
router.delete('/:id', authorize('superadmin'), deletePharmacy)

module.exports = router
