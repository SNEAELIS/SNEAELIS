const { Pool } = require('pg');

// Configuração da pool de conexões usando a variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://users_4t7z_user:DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8@dpg-ct0ent1u0jms73c4dslg-a/users_4t7z',
  ssl: {
    rejectUnauthorized: false, // Necessário para conexões seguras no Render
  },
});

// Testa a conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão bem-sucedida com o PostgreSQL:', res.rows);
  }
});

module.exports = pool;