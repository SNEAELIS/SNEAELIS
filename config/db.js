const { Pool } = require('pg');
require('dotenv').config();

module.exports = async function initializePool() {
  // Configuração para Render.com (usando DATABASE_URL)
  if (process.env.RENDER || process.env.DATABASE_URL) {
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://users_4t7z_user:DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8@dpg-ct0ent1u0jms73c4dslg-a:5432/users_4t7z';
    
    const poolConfig = {
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      }
    };

    console.log('🔧 Modo Render.com detectado - Configurações de produção ativadas');
    console.log('🔗 Conectando ao banco:', connectionString.replace(/(:\/\/[^:]+:)([^@]+)/, '$1*****@') + '...');
    
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
  const logConfig = config.connectionString 
    ? { connectionString: config.connectionString.replace(/(:\/\/[^:]+:)([^@]+)/, '$1*****@') }
    : { ...config, password: '*****' };

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
    
    if (connectionName === 'Render PostgreSQL') {
      console.error('\n🔧 Dicas para Render.com:');
      console.error('1. Verifique se a DATABASE_URL está configurada corretamente');
      console.error('2. Confira se o banco está "Available" no painel');
      console.error('3. Teste a conexão externa com o comando:');
      console.error(`   psql "${config.connectionString || 'SUA_DATABASE_URL'}"`);
    } else {
      console.error('\n🔧 Dicas para ambiente local:');
      console.error('1. Verifique se o PostgreSQL está rodando');
      console.error('2. Confira as credenciais no arquivo .env');
      console.error(`3. Teste com: psql -h ${config.host} -U ${config.user} -d ${config.database}`);
    }
    
    throw err;
  }
}