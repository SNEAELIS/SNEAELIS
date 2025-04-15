const { Pool } = require('pg');

// Use apenas configuração local
module.exports = async function initializePool() {
  const localConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'site_login',
    password: 'mesp@123456',
    port: 5432,
  };

  const pool = new Pool(localConfig);
  try {
    await pool.query('SELECT NOW()');
    console.log('Conectado ao banco local');
    return pool;
  } catch (err) {
    console.error('Falha na conexão local:', err);
    throw err;
  }
};