const mongoose = require('mongoose');
const { credentials } = require('../config');
const { connectionString } = credentials.mongo
const Vacation = require('../models/vacation');
const VacationInSeasonListener = require('../models/vacationInSeasonListener');

require('./populate');


if (!connectionString) {
    console.error('MongoDB connection string missing!');
    process.exit(1);
}

mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connection established!'))
    .catch(err => console.log(`MongoDB error: ${err.message}`));

const db = mongoose.connection;
db.on('error', err => {
    console.error(`MongoDB error: ${err.message}`);
    process.exit(1);
});

db.on('connection', () => console.log('Connected!'));


module.exports = {
    getVacations: async (options = {}) => Vacation.find(options),
    addVacationInSeasonListener: async (email, sku) => {
        await VacationInSeasonListener.updateOne(
            { email },
            { $push: { skus: sku } },
            { upsert: true }
        )
    }
}