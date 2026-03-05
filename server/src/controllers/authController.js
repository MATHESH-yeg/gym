const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Register a User (MASTER, ONLINE_COACH, BOTH)
const registerMaster = async (req, res) => {
    const {
        email,
        password,
        fullName,
        accountType, // 'MASTER', 'ONLINE_COACH', 'BOTH'
        gymName,
        gymLocation,
        yearsOfExperience,
        phone
    } = req.body;

    // Validation
    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    if (!accountType) {
        return res.status(400).json({ error: 'Account type is required' });
    }

    if ((accountType === 'MASTER' || accountType === 'BOTH') && !gymName) {
        return res.status(400).json({ error: 'Gym name is required for Master accounts' });
    }
    if ((accountType === 'ONLINE_COACH' || accountType === 'BOTH') && (yearsOfExperience === undefined || yearsOfExperience === null || yearsOfExperience === '')) {
        return res.status(400).json({ error: 'Years of experience is required for Online Coach accounts' });
    }

    // ✅ Role must be computed INSIDE the function
    const role = accountType === 'ONLINE_COACH' ? 'ONLINE_COACH' : 'MASTER';

    try {
        await query('BEGIN');

        const normalizedEmail = email.trim().toLowerCase();

        // If email exists -> 400
        const existing = await query(
            'SELECT id FROM users WHERE email = $1',
            [normalizedEmail]
        );
        if (existing.rows.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'Email already registered' });
        }

        let brandId = null;
        let branchId = null;

        // Create Brand/Branch only for MASTER/BOTH
        if (accountType === 'MASTER' || accountType === 'BOTH') {
            const brandRes = await query(
                'INSERT INTO brands (name) VALUES ($1) RETURNING id',
                [gymName]
            );
            brandId = brandRes.rows[0].id;

            const branchRes = await query(
                'INSERT INTO branches (brand_id, name, location) VALUES ($1, $2, $3) RETURNING id',
                [brandId, gymName, gymLocation || null]
            );
            branchId = branchRes.rows[0].id;
        }

        // Generate Login Code based on accountType
        let loginCode = '';
        const cleanGymName = (gymName || '').replace(/\s+/g, '').toUpperCase();
        const cleanFullName = (fullName || '').replace(/\s+/g, '').toUpperCase();

        if (accountType === 'MASTER') {
            loginCode = `${cleanGymName}MASTER`;
        } else if (accountType === 'ONLINE_COACH') {
            loginCode = `${cleanGymName}COACH`;
        } else if (accountType === 'BOTH') {
            loginCode = `${cleanFullName}${cleanGymName}`;
        } else {
            loginCode = `USER${Date.now().toString().slice(-6)}`;
        }

        // Ensure loginCode is unique (simplified: append random 4-digit if exists)
        const codeCheck = await query('SELECT id FROM users WHERE login_code = $1', [loginCode]);
        if (codeCheck.rows.length > 0) {
            loginCode += Math.floor(1000 + Math.random() * 9000).toString();
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user (matches your current DB columns)
        const userRes = await query(
            `INSERT INTO users
        (email, password_hash, full_name, role, brand_id, branch_id, account_type, years_of_experience, is_active, login_code, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9,$10)
       RETURNING id, email, full_name, role, brand_id, branch_id, account_type, years_of_experience, created_at, login_code, phone`,
            [
                normalizedEmail,
                hashedPassword,
                fullName,
                role,
                brandId,
                branchId,
                accountType,
                (accountType === 'ONLINE_COACH' || accountType === 'BOTH') ? Number(yearsOfExperience) : null,
                loginCode,
                phone
            ]
        );

        await query('COMMIT');

        const user = userRes.rows[0];
        // Add gym details for immediate use in frontend
        const userWithGym = {
            ...user,
            gymName: gymName,
            gymLocation: gymLocation,
            yearsOfExperience: yearsOfExperience,
            phone: phone
        };

        const accessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id, account_type: user.account_type },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        return res.status(201).json({ user: userWithGym, accessToken, refreshToken });
    } catch (err) {
        try { await query('ROLLBACK'); } catch (_) { }

        console.error('REGISTER_MASTER ERROR:', err);

        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already registered' });
        }

        return res.status(500).json({
            error: 'Registration failed',
            code: err.code,
            detail: err.message
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await query(
            `SELECT u.*, b.name as gym_name, br.location as gym_location
             FROM users u
             LEFT JOIN brands b ON u.brand_id = b.id
             LEFT JOIN branches br ON u.branch_id = br.id
             WHERE (u.email = $1 OR u.login_code = $1) AND u.is_active = TRUE`,
            [email.trim().toLowerCase()]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        const accessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id, account_type: user.account_type },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        // remove sensitive
        delete user.password_hash;

        return res.json({ user, accessToken, refreshToken });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const result = await query(
            'SELECT id, role, brand_id, branch_id, account_type FROM users WHERE id = $1 AND is_active = TRUE',
            [decoded.id]
        );
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'User no longer active' });

        const newAccessToken = jwt.sign(
            { id: user.id, role: user.role, brand_id: user.brand_id, branch_id: user.branch_id, account_type: user.account_type },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        return res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
};

module.exports = { registerMaster, login, refresh };