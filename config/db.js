const { Pool } = require('pg');
require('dotenv').config(); // Carrega variáveis do .env

module.exports = async function initializePool() {
  // Configuração padrão para desenvolvimento local
  const defaultConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'site_login',
    password: process.env.DB_PASSWORD || 'mesp@123456',
    port: process.env.DB_PORT || 5432,
  };

  // Configuração específica para produção (Render.com)
  const productionConfig = {
    ...defaultConfig,
    ssl: { rejectUnauthorized: false } // Necessário para Render.com
  };

  // Escolhe a configuração baseada no ambiente
  const poolConfig = process.env.NODE_ENV === 'production' 
    ? productionConfig 
    : defaultConfig;

  const pool = new Pool(poolConfig);
  
  try {
    // Testa a conexão com um query simples
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco de dados com sucesso');
    return pool;
  } catch (err) {
    console.error('❌ Falha na conexão com o banco:', err);
    
    // Mensagens de erro mais amigáveis
    if (err.code === 'ECONNREFUSED') {
      console.error('\n👉 Verifique:');
      console.error('- Se o servidor PostgreSQL está rodando');
      console.error('- Se as credenciais estão corretas');
      console.error('- Se o firewall permite conexões na porta', poolConfig.port);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('\n👉 Dica Render.com:');
        console.error('- Confira se criou o banco PostgreSQL no Render');
        console.error('- Verifique as variáveis de ambiente no painel do Render');
      }
    }
    
    throw err;
  }
};