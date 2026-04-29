const express = require('express')
const cors = require('cors')
const path = require('path')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

dotenv.config()

connectDB()

const app = express()

app.use(cors({
  origin: [process.env.FRONTEND_URI,'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
}))



app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically (optional - direct file send is used via controller)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/pharmacies',   require('./routes/pharmacies'))
app.use('/api/medicines',    require('./routes/medicines'))
app.use('/api/inventory',    require('./routes/inventory'))
app.use('/api/reservations', require('./routes/reservations'))

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MedConnect API is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  })
})

// ─── SERVE FRONTEND IN PRODUCTION ─────────────────────────────────────────────
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../medconnect-frontend/dist')))
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../medconnect-frontend/dist', 'index.html'))
//   })
// }


//live backend onrender
// const PORT = process.env.PORT || 5000

// app.listen(PORT, () => {
//   console.log(`MedConnect Server running on port ${PORT}`)
// })

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use(errorHandler)

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n MedConnect Server running on 
    http://localhost:${PORT}`
  )
  console.log(` API Base URL: http://localhost:${PORT}/api`)
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`\n Available Routes:`)
  console.log(`   POST   /api/auth/register`)
  console.log(`   POST   /api/auth/login`)
  console.log(`   GET    /api/auth/me`)
  console.log(`   GET    /api/pharmacies`)
  console.log(`   GET    /api/medicines`)
  console.log(`   GET    /api/medicines/search/nearby`)
  console.log(`   GET    /api/inventory`)
  console.log(`   GET    /api/inventory/alerts/low-stock`)
  console.log(`   GET    /api/reservations`)
  console.log(`   GET    /api/reservations/my`)
  console.log(`   GET    /api/health\n`)
})

module.exports = app
