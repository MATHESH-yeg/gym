const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const initDb = async () => {
    try {
        console.log('⏳ Initializing Database...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('✅ Database Schema Implemented Successfully');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    } finally {
        await pool.end();
    }
};

initDb();
