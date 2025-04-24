const { Pool } = require('pg');
require('dotenv').config();

module.exports = async function initializePool() {
  // Debug: Mostra qual ambiente está sendo detectado
  console.log('🔍 Ambiente detectado:', 
    process.env.RENDER ? 'Render' : 
    process.env.DATABASE_URL ? 'Produção (DATABASE_URL)' : 
    'Desenvolvimento local');

  // Conexão para Render/Produção
  if (process.env.RENDER || process.env.DATABASE_URL) {
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://users_4t7z_user:DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8@dpg-ct0ent1u0jms73c4dslg-a:5432/users_4t7z';
    
    const poolConfig = {
      connectionString: connectionString,
      ssl: process.env.RENDER ? { 
        rejectUnauthorized: false,
        sslmode: 'require'
      } : false
    };

    console.log('🔗 Tentando conectar ao banco de dados do Render...');
    return testConnection(poolConfig, 'Render PostgreSQL');
  }

  // Conexão para desenvolvimento local
  const localConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres', // Altere para sua senha local
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'site_login',
    port: parseInt(process.env.DB_PORT || '5432', 10)
  };

  console.log('💻 Tentando conectar ao banco de dados local...');
  return testConnection(localConfig, 'PostgreSQL local');
};

async function testConnection(config, connectionName) {
  // Esconde informações sensíveis nos logs
  const logConfig = config.connectionString 
    ? { connectionString: config.connectionString.replace(/(:\/\/[^:]+:)([^@]+)/, '$1*****@') }
    : { ...config, password: '*****' };

  console.log('⚙️ Configuração de conexão:', logConfig);

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
    
    if (connectionName === 'Render PostgreSQL') {
      console.error('\n🔧 Dicas para Render:');
      console.error('1. Verifique se a DATABASE_URL está correta');
      console.error('2. Confira se o banco está "Available" no painel');
      console.error('3. Teste manualmente:');
      console.error(`   psql "${config.connectionString}"`);
    } else {
      console.error('\n🔧 Dicas para ambiente local:');
      console.error('1. Verifique se o PostgreSQL está rodando');
      console.error('2. Confira o arquivo .env');
      console.error('3. Teste com:');
      console.error(`   psql -h ${config.host} -U ${config.user} -d ${config.database}`);
    }
    
    throw err;
  }
}