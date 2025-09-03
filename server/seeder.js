const mongoose = require('mongoose');
require('dotenv').config();

// Load data and models
const users = require('./data/users');
const User = require('./models/User');
const Election = require('./models/Election');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeder...');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        // Clear existing data
        await Election.deleteMany();
        await User.deleteMany();

        // Insert new users
        await User.insertMany(users);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Election.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const runSeeder = async () => {
    await connectDB();

    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

runSeeder();