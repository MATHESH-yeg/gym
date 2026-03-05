const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigrations() {
    console.log('🚀 Running database migrations...');
    try {
        // 1. Add MASTER to user_role enum
        // Note: In PG, you can't easily run ALTER TYPE inside a transaction block in some versions, 
        // and we need to check if it exists first.
        try {
            await pool.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MASTER'");
            console.log("✅ Added 'MASTER' to user_role enum");
        } catch (e) {
            console.log("ℹ️ Skipping 'MASTER' role add (might already exist or enum name different)");
            console.error(e.message);
        }

        // 2. Add BRAND_ADMIN back if users prefer, or ensure it exists
        // Actually, we changed BRAND_ADMIN to MASTER in the code.

        // 3. Ensure tables have correct columns (from migration_v1.sql)
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE account_type_enum AS ENUM ('MASTER', 'ONLINE_COACH', 'BOTH');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type account_type_enum");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER");

        console.log('✅ Migrations completed successfully');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigrations();
