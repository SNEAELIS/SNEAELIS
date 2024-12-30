const { Pool } = require('pg');
const cors = require('cors');
const express = require('express');

const remoteConfig = {
  connectionString: process.env.REMOTE_DB_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

const localConfig = {
  user: process.env.LOCAL_DB_USER || 'postgres',
  host: process.env.LOCAL_DB_HOST || 'localhost',
  database: process.env.LOCAL_DB_NAME || 'site_login',
  password: process.env.LOCAL_DB_PASSWORD || '1234',
  port: process.env.LOCAL_DB_PORT || 5432,
};

let pool;

async function habilitarPgcrypto(pool) {
  if (!pool) throw new Error('Pool de conexão não inicializado.');
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    console.log('Extensão pgcrypto habilitada com sucesso.');
  } catch (err) {
    console.error('Erro ao habilitar pgcrypto:', err.message);
    throw err;
  }
}

async function connectToDatabase(config, name) {
  try {
    console.log(`Tentando conectar ao banco ${name}...`);
    const testPool = new Pool(config);
    const res = await testPool.query('SELECT NOW()');
    console.log(`Conexão bem-sucedida com o banco ${name}:`, res.rows[0]);
    await habilitarPgcrypto(testPool);
    pool = testPool;
    return true;
  } catch (err) {
    console.error(`Erro ao conectar ao banco ${name}:`, err.message);
    return false;
  }
}

(async () => {
  const remoteConnected = await connectToDatabase(remoteConfig, 'remoto');

  if (!remoteConnected) {
    const localConnected = await connectToDatabase(localConfig, 'local');
    if (!localConnected) {
      console.error('Falha ao conectar a ambos os bancos de dados. Encerrando aplicação.');
      process.exit(1);
    }
  }

  // Fechar o pool ao encerrar o aplicativo
  process.on('SIGINT', async () => {
    console.log('Encerrando pool de conexões...');
    if (pool) await pool.end();
    process.exit(0);
  });

  // Servidor Express
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Servidor rodando!');
  });

  app.listen(10000, () => {
    console.log('Servidor rodando na porta 10000');
  });
})();

module.exports = () => pool;
