const { query, pool } = require('./src/config/db');

async function check() {
    try {
        const u = await query("SELECT count(*) FROM users");
        const b = await query("SELECT count(*) FROM brands");
        const br = await query("SELECT count(*) FROM branches");
        console.log(`Users: ${u.rows[0].count}, Brands: ${b.rows[0].count}, Branches: ${br.rows[0].count}`);

        // Check if columns exist
        const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        const colNames = cols.rows.map(r => r.column_name);
        console.log("User Columns JSON:", JSON.stringify(colNames));
    } catch (e) {
        console.error("CHECK ERROR:", e.message);
    } finally {
        await pool.end();
    }
}
check();
