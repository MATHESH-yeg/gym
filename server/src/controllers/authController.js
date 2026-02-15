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

        // Generate Access Token (Short-lived)
        const accessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, account_type: user.account_type },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        // Generate Refresh Token (Long-lived)
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        res.status(201).json({ user, accessToken, refreshToken });

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

        const accessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        // Remove password from response
        delete user.password_hash;

        res.json({ user, accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Fetch user to ensure they still exist/are active
        const result = await query('SELECT id, role, brand_id, branch_id FROM users WHERE id = $1 AND is_active = TRUE', [decoded.id]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'User no longer active' });

        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};

module.exports = { registerMaster, login, refresh };
