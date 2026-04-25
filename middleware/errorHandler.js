const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  console.error('Error:', err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`
    return res.status(404).json({ success: false, message: error.message })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    return res.status(400).json({ success: false, message: error.message })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    error.message = messages.join(', ')
    return res.status(400).json({ success: false, message: error.message })
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  })
}

module.exports = errorHandler
