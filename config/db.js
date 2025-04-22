const { Pool } = require('pg');
require('dotenv').config();

module.exports = async function initializePool() {
  // Validação das variáveis de ambiente em produção
  if (process.env.NODE_ENV === 'production') {
    const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      throw new Error(`❌ Variáveis de ambiente faltando no Render: ${missingVars.join(', ')}`);
    }
  }

  // Configuração baseada em ambiente
  const poolConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'site_login',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };

  // Configurações específicas para produção
  if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = { 
      rejectUnauthorized: false,
      // Configurações adicionais para Render.com
      sslmode: 'require'
    };
    poolConfig.application_name = 'site_login_render';
  }

  console.log('🔧 Configuração do pool:', {
    ...poolConfig,
    password: poolConfig.password ? '*****' : 'undefined'
  });

  const pool = new Pool(poolConfig);
  
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time');
      console.log('✅ Conexão bem-sucedida. Hora atual do banco:', res.rows[0].current_time);
      return pool;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Falha na conexão com o banco:', {
      message: err.message,
      code: err.code,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });

    // Dicas específicas para Render.com
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🔧 Dicas para Render.com:');
      console.error('1. Verifique se criou um banco PostgreSQL no Render');
      console.error('2. Confira se as variáveis de ambiente estão corretas');
      console.error('3. O banco pode levar alguns minutos para ficar pronto após a criação');
      console.error('4. Verifique a conexão externa no painel do banco');
    }

    throw err;
  }
};