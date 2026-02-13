const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Register a User (Master, Online Coach, or Both)
const registerMaster = async (req, res) => {
    const {
        email,
        password,
        fullName,
        accountType, // 'MASTER', 'ONLINE_COACH', 'BOTH'
        gymName,
        gymLocation,
        yearsOfExperience
    } = req.body;

    // Validation
    if (!accountType) return res.status(400).json({ error: 'Account type is required' });

    if ((accountType === 'MASTER' || accountType === 'BOTH') && !gymName) {
        return res.status(400).json({ error: 'Gym name is required for Master accounts' });
    }
    if ((accountType === 'ONLINE_COACH' || accountType === 'BOTH') && !yearsOfExperience) {
        return res.status(400).json({ error: 'Years of experience is required for Online Coach accounts' });
    }

    try {
        await query('BEGIN');

        let brandId = null;
        let branchId = null;

        // 1. Create Brand/Branch if needed
        if (accountType === 'MASTER' || accountType === 'BOTH') {
            const brandRes = await query(
                'INSERT INTO brands (name) VALUES ($1) RETURNING id',
                [gymName]
            );
            brandId = brandRes.rows[0].id;

            const branchRes = await query(
                'INSERT INTO branches (brand_id, name, location) VALUES ($1, $2, $3) RETURNING id',
                [brandId, gymName, gymLocation]
            );
            branchId = branchRes.rows[0].id;
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        const userRes = await query(
            `INSERT INTO users 
            (email, password_hash, full_name, role, brand_id, branch_id, account_type, years_of_experience) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id, role, brand_id, branch_id, account_type`,
            [
                email,
                hashedPassword,
                fullName,
                'BRAND_ADMIN',
                brandId,
                branchId,
                accountType,
                (accountType === 'ONLINE_COACH' || accountType === 'BOTH') ? yearsOfExperience : null
            ]
        );

        await query('COMMIT');

        const user = userRes.rows[0];
        const token = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, account_type: user.account_type },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({ user, token });

    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Registration failed. Email might already exist.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        // Update last login
        await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Remove password from response
        delete user.password_hash;

        res.json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { registerMaster, login };
