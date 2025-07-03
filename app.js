const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth')

dotenv.config()

const app = express()
app.use(express.json())

// Routes
app.use('/api', authRoutes)
app.use('/api', adminRoutes)
app.use('/api', userRoutes)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Connected')
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error('MongoDB connection failed:', err.message);
});