const { query, pool } = require('./src/config/db');

async function check() {
    try {
        const res = await query('SELECT email, role, login_code FROM users');
        console.log('--- REGISTERED USERS ---');
        res.rows.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | Login Code: ${u.login_code || 'N/A'}`);
        });
        console.log('------------------------');
    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await pool.end();
    }
}
check();
