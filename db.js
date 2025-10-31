const mongoose = require('mongoose');
const DatabaseSeeder = require('./database/seeders/DatabaseSeeder');
const { databaseURL } = require('./config/app');

async function connectDB() {
    try {
        await mongoose.connect(databaseURL)
        console.log('database connected!');
        /**
        * @note run seeder once. multiple seed can cause database error.
        */
        const runSeeder = process.env.RUN_SEED.toLowerCase() === 'true';
        if(runSeeder) {
            DatabaseSeeder.run().then(result => {
                if(result) {
                    console.log('Seed successful!');
                } else {
                    console.log('Failed to seed data');
                }
            })
        }
    } catch(error) {
        console.log(error);
    }
}

module.exports = connectDB;