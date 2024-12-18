const { Pool } = require('pg');
const cors = require('cors');
const express = require('express');

const remoteConfig = {
  connectionString: 'postgresql://users_4t7z_user:DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8@dpg-ct0ent1u0jms73c4dslg-a.oregon-postgres.render.com/users_4t7z',
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

const localConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'site_login',
  password: '1234',
  port: 5432,
};

let pool;

async function habilitarPgcrypto(pool) {
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
    pool = new Pool(config);
    const res = await pool.query('SELECT NOW()');
    console.log(`Conexão bem-sucedida com o banco ${name}:`, res.rows[0]);
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
})();

module.exports = () => pool;
