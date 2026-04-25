const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const {
  getAllMedicines, getMedicineById, searchNearby,
  createMedicine, updateMedicine, deleteMedicine
} = require('../controllers/medicineController')

router.use(protect)

router.get('/search/nearby', searchNearby)
router.get('/', getAllMedicines)
router.get('/:id', getMedicineById)
router.post('/', authorize('admin', 'superadmin'), createMedicine)
router.put('/:id', authorize('admin'), updateMedicine)         //, 'superadmin'
router.delete('/:id', authorize('admin'), deleteMedicine)      //, 'superadmin'

module.exports = router
