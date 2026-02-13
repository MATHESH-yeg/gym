-- Migration: Add account_type and years_of_experience to users
-- Date: 2026-02-13

-- 1. Create account_type ENUM if it doesn't exist
DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM ('MASTER', 'ONLINE_COACH', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type account_type_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- 3. Set default account_type for existing records
UPDATE users SET account_type = 'MASTER' WHERE account_type IS NULL;

-- 4. Set gym_name (brand_id) and location (branch_id) to nullable is already handled by the schema
-- but let's ensure we can have users without a brand_id if they are just ONLINE_COACH.
-- Currently brand_id is REFERENCES brands(id) ON DELETE SET NULL, so it's already nullable.
