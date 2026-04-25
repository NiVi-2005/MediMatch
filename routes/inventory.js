const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const {
  getAllInventory, getInventoryById, getLowStock, getHighDemand,
  createInventory, updateInventory, deleteInventory
} = require('../controllers/inventoryController')

router.use(protect)
router.use(authorize('admin'))   //, 'superadmin'

router.get('/alerts/low-stock', getLowStock)
router.get('/alerts/high-demand', getHighDemand)
router.get('/', getAllInventory)
router.get('/:id', getInventoryById)
router.post('/', createInventory)
router.put('/:id', updateInventory)
router.delete('/:id', deleteInventory)

module.exports = router
