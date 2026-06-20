const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

let pool = null;

const connectDB = async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ MSSQL Connected:', process.env.DB_NAME);
        return pool;
    } catch (err) {
        console.error('❌ DB Connection Failed:', err.message);
        process.exit(1);
    }
};

const getPool = () => {
    if (!pool) throw new Error('DB not connected.');
    return pool;
};

module.exports = { connectDB, getPool, sql };