// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const electionRoutes = require('./routes/electionRoutes'); // <-- ADD THIS

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes); // <-- AND ADD THIS

app.get('/', (req, res) => {
    res.send('Blockchain Voting System Backend is running!');
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});