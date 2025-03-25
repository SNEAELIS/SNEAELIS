const { Pool } = require('pg');

// Configuração para o banco remoto (Render.com)
const remoteConfig = {
  user: 'users_4t7z_user',
  host: 'dpg-ct0ent1u0jms73c4dslg-a',
  database: 'users_4t7z',
  password: 'DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8', // Confirme se esta é a senha correta
  port: 5432,
  ssl: { rejectUnauthorized: false }, // Necessário para Render.com
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

// Configuração para o banco local (fallback)
const localConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'site_login',
  password: 'mesp@123456',
  port: 5432,
};

let pool;

// Função de conexão com retry
const connectWithRetry = async () => {
  try {
    console.log('Tentando conectar ao banco remoto...');
    pool = new Pool(remoteConfig);
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado ao banco remoto:', res.rows[0]);
  } catch (remoteErr) {
    console.error('Falha na conexão remota:', remoteErr.message);
    console.log('Tentando conexão local em 5 segundos...');
    await new Promise((res) => setTimeout(res, 5000));
    try {
      pool = new Pool(localConfig);
      const res = await pool.query('SELECT NOW()');
      console.log('Conectado ao banco local:', res.rows[0]);
    } catch (localErr) {
      console.error('Falha na conexão local:', localErr.message);
      throw localErr; // Para evitar loop infinito
    }
  }
  pool.on('connect', () => console.log('Nova conexão estabelecida com o banco'));
  pool.on('error', (err) => console.error('Erro no pool:', err));
};

// Inicializa o pool e retorna ele
const initializePool = async () => {
  await connectWithRetry();
  return pool;
};

// Exporta o pool como uma Promise
module.exports = initializePool;