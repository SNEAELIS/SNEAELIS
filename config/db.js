const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Substitua pelo usuário do banco
  host: 'localhost', // Host do PostgreSQL
  database: 'site_login', // Nome do banco de dados
  password: '1234', // Substitua pela sua senha
  port: 5432, // Porta padrão
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão bem-sucedida com o PostgreSQL:', res.rows);
  }
});

module.exports = pool;