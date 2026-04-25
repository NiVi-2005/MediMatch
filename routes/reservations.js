const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getAllReservations, getMyReservations, getReservationById,
  createReservation, updateReservation, updateStatus, deleteReservation,
  uploadPrescription, viewPrescription,
} = require('../controllers/reservationController')

router.use(protect)

// User routes
router.get('/my', getMyReservations)
router.post('/', authorize('user'), upload.single('prescription'), createReservation)
router.delete('/:id', authorize('user', 'admin'), deleteReservation)           //, 'superadmin'
router.post('/prescription', authorize('user'), upload.single('prescription'), uploadPrescription)
router.get('/:id/prescription', viewPrescription)

// Admin / superadmin routes
router.get('/', authorize('admin'), getAllReservations)         //, 'superadmin'
router.put('/:id/status', authorize('admin'), updateStatus)     //, 'superadmin'
router.put('/:id', updateReservation)
router.get('/:id', getReservationById)

module.exports = router
