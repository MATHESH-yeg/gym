const { query, pool } = require('./src/config/db');

async function inspectTable() {
    try {
        const res = await query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('users', 'brands', 'branches')
            ORDER BY table_name, ordinal_position
        `);
        console.log('--- DATABASE SCHEMA INSPECTION ---');
        res.rows.forEach(col => {
            console.log(`[${col.table_name}] ${col.column_name} (${col.data_type})`);
        });
        console.log('--- END INSPECTION ---');

    } catch (err) {
        console.error('Error inspecting table:', err);
    } finally {
        await pool.end();
    }
}

inspectTable();
