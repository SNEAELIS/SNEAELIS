const { Pool } = require('pg');
require('dotenv').config();

module.exports = async function initializePool() {
  // Detecta automaticamente se está no Render
  const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
  
  // Configurações padrão para desenvolvimento local
  let poolConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'site_login',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };

  // Sobrescreve com configurações do Render se detectado
  if (isRender) {
    poolConfig = {
      user: process.env.DB_USER || 'users_4t7z_user',
      password: process.env.DB_PASSWORD || 'DlUHjtOhLtrvaWm3bvGRCu7uqVQ3PiH8',
      host: process.env.DB_HOST || 'dpg-ct0ent1u0jms73c4dslg-a',
      database: process.env.DB_NAME || 'users_4t7z',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      },
      application_name: 'site_login_render'
    };
    
    console.log('🔧 Modo Render.com detectado - Configurações de produção ativadas');
  }

  console.log('⚙️ Configuração do Pool:', {
    ...poolConfig,
    password: '*****' // Esconde a senha nos logs
  });

  const pool = new Pool(poolConfig);
  
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time');
      console.log(`✅ Conexão bem-sucedida com ${isRender ? 'Render.com' : 'banco local'}`);
      console.log('⏱ Hora do banco:', res.rows[0].current_time);
      return pool;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Falha na conexão com o banco de dados:');
    console.error('Mensagem:', err.message);
    
    if (isRender) {
      console.error('\n🔧 Dicas para Render.com:');
      console.error('1. Verifique se todas as variáveis de ambiente estão configuradas');
      console.error('2. Confira se o banco está "Available" no painel');
      console.error('3. URL de conexão:', 
        `postgresql://${poolConfig.user}:*****@${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
    } else {
      console.error('\n🔧 Dicas para ambiente local:');
      console.error('1. Verifique se o PostgreSQL está rodando localmente');
      console.error('2. Confira usuário/senha no arquivo .env');
      console.error('3. Teste a conexão com: psql -U postgres -h localhost');
    }
    
    throw err;
  }
};