const { Pool } = require('pg');
require('dotenv').config();

module.exports = async function initializePool() {
  // Prioridade máxima para DATABASE_URL (usada pelo Render)
  if (process.env.DATABASE_URL) {
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };

    console.log('🔧 Modo Render.com detectado - usando DATABASE_URL');
    return testConnection(poolConfig, 'Render PostgreSQL');
  }

  // Configuração para desenvolvimento local
  const localConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'site_login',
    port: parseInt(process.env.DB_PORT || '5432', 10)
  };

  console.log('💻 Modo desenvolvimento local detectado');
  return testConnection(localConfig, 'PostgreSQL local');
};

async function testConnection(config, connectionName) {
  // Esconde informações sensíveis nos logs
  const logConfig = { ...config };
  if (logConfig.password) logConfig.password = '*****';
  if (logConfig.connectionString) {
    logConfig.connectionString = logConfig.connectionString.replace(
      /:\/\/([^:]+):([^@]+)/, 
      '://$1:*****'
    );
  }

  console.log('⚙️ Configuração do Pool:', logConfig);

  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time');
      console.log(`✅ Conexão bem-sucedida com ${connectionName}`);
      console.log('⏱ Hora do banco:', res.rows[0].current_time);
      return pool;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`❌ Falha na conexão com ${connectionName}:`);
    console.error('Mensagem:', err.message);
    
    // Dicas específicas para cada ambiente
    if (connectionName === 'Render PostgreSQL') {
      console.error('\n🔧 Dicas para Render.com:');
      console.error('1. Verifique se o banco está "Available" no painel');
      console.error('2. Confira a DATABASE_URL nas variáveis de ambiente');
      console.error('3. A conexão deve ser externa (não use localhost)');
    } else {
      console.error('\n🔧 Dicas para ambiente local:');
      console.error('1. Verifique se o PostgreSQL está rodando');
      console.error(`2. Teste a conexão manualmente: psql -h ${config.host} -U ${config.user} -d ${config.database}`);
      console.error('3. Confira o arquivo .env');
    }
    
    throw err;
  }
}