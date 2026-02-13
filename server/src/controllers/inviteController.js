const { query } = require('../config/db');
const crypto = require('crypto');

// Generate an invite code for a trainer
const generateInvite = async (req, res) => {
    const { email } = req.body;
    const brand_id = req.user.brand_id; // From JWT

    try {
        const inviteCode = 'OLV-INV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        const result = await query(
            'INSERT INTO trainer_invites (brand_id, invite_code, email, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [brand_id, invite_code, email, expiresAt]
        );

        res.status(201).json({
            message: 'Invite generated successfully',
            invite: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate invite' });
    }
};

// Trainer Joins via Invite Code
const registerTrainer = async (req, res) => {
    const { inviteCode, email, password, fullName } = req.body;

    try {
        // 1. Validate Invite
        const inviteRes = await query(
            'SELECT * FROM trainer_invites WHERE invite_code = $1 AND email = $2 AND is_used = FALSE AND expires_at > CURRENT_TIMESTAMP',
            [inviteCode, email]
        );

        if (inviteRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired invite code' });
        }

        const invite = inviteRes.rows[0];

        // 2. Hash Password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Create Trainer User
        await query('BEGIN');

        const userRes = await query(
            'INSERT INTO users (email, password_hash, full_name, role, brand_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, role, brand_id',
            [email, password_hash, fullName, 'TRAINER', invite.brand_id]
        );

        // 4. Mark Invite as Used
        await query('UPDATE trainer_invites SET is_used = TRUE WHERE id = $1', [invite.id]);

        await query('COMMIT');

        res.status(201).json({
            message: 'Trainer registered successfully',
            user: userRes.rows[0]
        });

    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

module.exports = { generateInvite, registerTrainer };
