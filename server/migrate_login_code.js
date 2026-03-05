const { query, pool } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Adding login_code column to users table...');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS login_code VARCHAR(255) UNIQUE');
        console.log('✅ Migration successful');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
