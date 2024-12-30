const { Pool } = require('pg');
const cors = require('cors');
const express = require('express');

const remoteConfig = {
  connectionString: 'postgresql://users_4t7z_user:DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8@dpg-ct0ent1u0jms73c4dslg-a/users_4t7z',
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

(async () => {
  try {
    console.log('Tentando conectar ao banco remoto...');
    pool = new Pool(remoteConfig);
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão bem-sucedida com o banco remoto:', res.rows[0]);
  } catch (remoteErr) {
    console.error('Erro ao conectar ao banco remoto:', remoteErr.message);

    try {
      console.log('Tentando conectar ao banco local...');
      pool = new Pool(localConfig);
      const res = await pool.query('SELECT NOW()');
      console.log('Conexão bem-sucedida com o banco local:', res.rows[0]);
    } catch (localErr) {
      console.error('Erro ao conectar ao banco local:', localErr.message);
      process.exit(1);
    }
  }
})();

module.exports = () => pool; // Garante que o pool atualizado seja exportado