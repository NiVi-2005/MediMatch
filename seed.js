const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')

dotenv.config()

const User      = require('./models/User')
const Pharmacy  = require('./models/Pharmacy')
const Medicine  = require('./models/Medicine')
const Inventory = require('./models/Inventory')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // ── 1. SUPERADMIN ──────────────────────────────────────────────────────────
    const existingSA = await User.findOne({ role: 'superadmin' })
    let superAdmin

    if (!existingSA) {
      superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@medconnect.com',
        password: 'superadmin123',
        role: 'superadmin',
        phone: '+91 99999 00000',
      })
      console.log('SuperAdmin created:')
      console.log('   Email   : superadmin@medconnect.com')
      console.log('   Password: superadmin123')
    } else {
      superAdmin = existingSA
      console.log('SuperAdmin already exists — skipping')
    }

    // ── 2. PHARMACIES ──────────────────────────────────────────────────────────
    const pharmacyData = [
      { name: 'Apollo Pharmacy,Anna Nagar', email: 'apollo.annanagar@medconnect.com', phone: '+91 44 2612 3456', address: '15, 2nd Avenue, Anna Nagar', city: 'Chennai', licenseNumber: 'TN-PH-001-2024', status: 'active' },
      { name: 'MedPlus,T. Nagar',           email: 'medplus.tnagar@medconnect.com',   phone: '+91 44 2434 5678', address: '45, Usman Road, T. Nagar',    city: 'Chennai', licenseNumber: 'TN-PH-002-2024', status: 'active' },
      { name: 'Wellness Forever,Adyar',     email: 'wellness.adyar@medconnect.com',   phone: '+91 44 2441 9876', address: '78, LB Road, Adyar',           city: 'Chennai', licenseNumber: 'TN-PH-003-2024', status: 'active' },
      { name: 'Sakthi Pharmacy,Coimbatore', email: 'sakthi.cbe@medconnect.com',       phone: '+91 422 234 5678', address: '23, RS Puram, Coimbatore',     city: 'Coimbatore', licenseNumber: 'TN-PH-004-2024', status: 'active' },
    ]

    let pharmacies = []
    for (const p of pharmacyData) {
      const exists = await Pharmacy.findOne({ name: p.name })
      if (!exists) {
        pharmacies.push(await Pharmacy.create(p))
        console.log(`Pharmacy created: ${p.name}`)
      } else {
        pharmacies.push(exists)
        console.log(`Pharmacy already exists: ${p.name}`)
      }
    }

    // ── 3. ADMIN USERS (one per pharmacy) ────────────────────────────────────
    const adminData = [
      { name: 'Rajan K',   email: 'admin.apollo@medconnect.com',    password: 'admin123', phone: '+91 98765 11111', pharmacyIndex: 0 },
      { name: 'Priya S',   email: 'admin.medplus@medconnect.com',   password: 'admin123', phone: '+91 98765 22222', pharmacyIndex: 1 },
      { name: 'Suresh V',  email: 'admin.wellness@medconnect.com',  password: 'admin123', phone: '+91 98765 33333', pharmacyIndex: 2 },
      { name: 'Lakshmi M', email: 'admin.sakthi@medconnect.com',    password: 'admin123', phone: '+91 98765 44444', pharmacyIndex: 3 },
    ]

    for (const a of adminData) {
      const exists = await User.findOne({ email: a.email })
      if (!exists) {
        await User.create({
          name: a.name, email: a.email, password: a.password,
          role: 'admin', phone: a.phone,
          pharmacyId: pharmacies[a.pharmacyIndex]._id,
        })
        console.log(`Admin created: ${a.email} / ${a.password}`)
      } else {
        console.log(`Admin already exists: ${a.email}`)
      }
    }

    // ── 4. SAMPLE USER ────────────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: 'user@medconnect.com' })
    if (!existingUser) {
      await User.create({
        name: 'Ananya Sharma', email: 'user@medconnect.com',
        password: 'user123', role: 'user', phone: '+91 98765 55555',
        address: 'Chennai, Tamil Nadu',
      })
      console.log('Sample User created:')
      console.log('   Email   : user@medconnect.com')
      console.log('   Password: user123')
    } else {
      console.log('Sample User already exists — skipping')
    }

    // ── 5. MEDICINES ──────────────────────────────────────────────────────────
    const medicineData = [
      { name: 'Dolo 650',         genericName: 'Paracetamol',       category: 'Analgesic',       manufacturer: 'Micro Labs',    dosage: '650mg',     requiresPrescription: false, description: 'Used to treat mild to moderate pain and fever.' },
      { name: 'Calpol 500',       genericName: 'Paracetamol',       category: 'Analgesic',       manufacturer: 'GSK',           dosage: '500mg',     requiresPrescription: false, description: 'Effective for headaches and fever reduction.' },
      { name: 'Augmentin 625',    genericName: 'Amoxicillin+Clavulanate', category: 'Antibiotic', manufacturer: 'GSK',          dosage: '625mg',     requiresPrescription: true,  description: 'Broad-spectrum antibiotic for bacterial infections.' },
      { name: 'Azithromycin 500', genericName: 'Azithromycin',      category: 'Antibiotic',      manufacturer: 'Cipla',         dosage: '500mg',     requiresPrescription: true,  description: 'Antibiotic for respiratory and skin infections.' },
      { name: 'Zyrtec 10mg',      genericName: 'Cetirizine',        category: 'Antihistamine',   manufacturer: 'UCB',           dosage: '10mg',      requiresPrescription: false, description: 'Antihistamine for allergies and hay fever.' },
      { name: 'Allegra 120',      genericName: 'Fexofenadine',      category: 'Antihistamine',   manufacturer: 'Sanofi',        dosage: '120mg',     requiresPrescription: false, description: 'For seasonal allergy relief.' },
      { name: 'Omez 20',          genericName: 'Omeprazole',        category: 'Antacid',         manufacturer: 'Dr. Reddy\'s',  dosage: '20mg',      requiresPrescription: false, description: 'Reduces stomach acid and treats acid reflux.' },
      { name: 'Pan 40',           genericName: 'Pantoprazole',      category: 'Antacid',         manufacturer: 'Alkem',         dosage: '40mg',      requiresPrescription: false, description: 'For gastroesophageal reflux disease (GERD).' },
      { name: 'Glycomet 500',     genericName: 'Metformin',         category: 'Diabetic',        manufacturer: 'USV',           dosage: '500mg',     requiresPrescription: true,  description: 'Oral diabetes medicine for type 2 diabetes.' },
      { name: 'Telma 40',         genericName: 'Telmisartan',       category: 'Cardiac',         manufacturer: 'Glenmark',      dosage: '40mg',      requiresPrescription: true,  description: 'Treats high blood pressure and reduces heart disease risk.' },
      { name: 'Atorva 10',        genericName: 'Atorvastatin',      category: 'Cardiac',         manufacturer: 'Zydus Cadila',  dosage: '10mg',      requiresPrescription: true,  description: 'Lowers cholesterol and triglycerides.' },
      { name: 'Limcee 500',       genericName: 'Vitamin C',         category: 'Vitamin/Supplement', manufacturer: 'Abbott',     dosage: '500mg',     requiresPrescription: false, description: 'Vitamin C supplement for immunity.' },
      { name: 'Corcium',          genericName: 'Calcium + Vitamin D3', category: 'Vitamin/Supplement', manufacturer: 'Alkem',  dosage: '1 tablet',  requiresPrescription: false, description: 'Calcium and Vitamin D3 for bone health.' },
      { name: 'Combiflam',        genericName: 'Ibuprofen+Paracetamol', category: 'Analgesic',  manufacturer: 'Sanofi',        dosage: '400mg+325mg', requiresPrescription: false, description: 'Combined anti-inflammatory and painkiller.' },
      { name: 'Montair LC',       genericName: 'Montelukast+Levocetirizine', category: 'Respiratory', manufacturer: 'Cipla',  dosage: '5mg+5mg',   requiresPrescription: true,  description: 'For allergic rhinitis and asthma symptoms.' },
    ]

    let medicines = []
    for (const m of medicineData) {
      const exists = await Medicine.findOne({ name: m.name })
      if (!exists) {
        medicines.push(await Medicine.create({ ...m, addedBy: superAdmin._id }))
        console.log(`Medicine created: ${m.name}`)
      } else {
        medicines.push(exists)
        console.log(`Medicine already exists: ${m.name}`)
      }
    }

    // ── 6. INVENTORY ──────────────────────────────────────────────────────────
    const inventoryData = [
      // Apollo Pharmacy – Anna Nagar (index 0)
      { medicineIndex: 0,  pharmacyIndex: 0, quantity: 250, price: 30,  threshold: 20, unit: 'tablets' },
      { medicineIndex: 1,  pharmacyIndex: 0, quantity: 180, price: 18,  threshold: 15, unit: 'tablets' },
      { medicineIndex: 2,  pharmacyIndex: 0, quantity: 8,   price: 145, threshold: 10, unit: 'strips'  },  // low stock
      { medicineIndex: 4,  pharmacyIndex: 0, quantity: 120, price: 55,  threshold: 10, unit: 'tablets' },
      { medicineIndex: 6,  pharmacyIndex: 0, quantity: 200, price: 42,  threshold: 15, unit: 'capsules'},
      { medicineIndex: 13, pharmacyIndex: 0, quantity: 300, price: 28,  threshold: 20, unit: 'tablets' },

      // MedPlus – T. Nagar (index 1)
      { medicineIndex: 0,  pharmacyIndex: 1, quantity: 400, price: 30,  threshold: 30, unit: 'tablets' },
      { medicineIndex: 3,  pharmacyIndex: 1, quantity: 6,   price: 89,  threshold: 10, unit: 'tablets' },  // low stock
      { medicineIndex: 5,  pharmacyIndex: 1, quantity: 95,  price: 110, threshold: 10, unit: 'tablets' },
      { medicineIndex: 7,  pharmacyIndex: 1, quantity: 160, price: 38,  threshold: 15, unit: 'tablets' },
      { medicineIndex: 8,  pharmacyIndex: 1, quantity: 5,   price: 20,  threshold: 10, unit: 'tablets' },  // low stock
      { medicineIndex: 11, pharmacyIndex: 1, quantity: 220, price: 12,  threshold: 20, unit: 'tablets' },

      // Wellness Forever – Adyar (index 2)
      { medicineIndex: 0,  pharmacyIndex: 2, quantity: 320, price: 29,  threshold: 25, unit: 'tablets' },
      { medicineIndex: 9,  pharmacyIndex: 2, quantity: 75,  price: 68,  threshold: 10, unit: 'tablets' },
      { medicineIndex: 10, pharmacyIndex: 2, quantity: 90,  price: 55,  threshold: 10, unit: 'tablets' },
      { medicineIndex: 12, pharmacyIndex: 2, quantity: 130, price: 95,  threshold: 10, unit: 'tablets' },
      { medicineIndex: 14, pharmacyIndex: 2, quantity: 7,   price: 75,  threshold: 10, unit: 'tablets' },  // low stock

      // Sakthi Pharmacy – Coimbatore (index 3)
      { medicineIndex: 0,  pharmacyIndex: 3, quantity: 500, price: 28,  threshold: 30, unit: 'tablets' },
      { medicineIndex: 1,  pharmacyIndex: 3, quantity: 210, price: 17,  threshold: 15, unit: 'tablets' },
      { medicineIndex: 6,  pharmacyIndex: 3, quantity: 180, price: 40,  threshold: 15, unit: 'capsules'},
      { medicineIndex: 13, pharmacyIndex: 3, quantity: 9,   price: 27,  threshold: 10, unit: 'tablets' },  // low stock
    ]

    for (const inv of inventoryData) {
      const med  = medicines[inv.medicineIndex]
      const phar = pharmacies[inv.pharmacyIndex]
      if (!med || !phar) continue
      const exists = await Inventory.findOne({ medicineId: med._id, pharmacyId: phar._id })
      if (!exists) {
        await Inventory.create({
          medicineId:   med._id,
          medicineName: med.name,
          pharmacyId:   phar._id,
          quantity:     inv.quantity,
          price:        inv.price,
          unit:         inv.unit,
          threshold:    inv.threshold,
          addedBy:      superAdmin._id,
        })
      }
    }
    console.log('Inventory seeded for all pharmacies')

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  SEED COMPLETE — Test Credentials')
    console.log('═══════════════════════════════════════════════════════')
    console.log('Super Admin  → superadmin@medconnect.com / superadmin123')
    console.log('Pharmacy 1   → admin.apollo@medconnect.com / admin123')
    console.log('Pharmacy 2   → admin.medplus@medconnect.com / admin123')
    console.log('Pharmacy 3   → admin.wellness@medconnect.com / admin123')
    console.log('Pharmacy 4   → admin.sakthi@medconnect.com / admin123')
    console.log('Sample User  → user@medconnect.com / user123')
    console.log('═══════════════════════════════════════════════════════\n')

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  } catch (err) {
    console.error(' Seed error:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
