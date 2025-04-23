const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const initializePool = require('../config/db');

// Configurações básicas
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function configurarBancoDeDados() {
  try {
    console.log('🔄 Iniciando configuração do banco de dados...');
    const pool = await initializePool();
    console.log('✅ Pool de conexão com o banco inicializado');

    // Verifica se está no Render e mostra informações úteis
    if (process.env.RENDER) {
      console.log('🌐 Ambiente Render detectado');
      console.log('🔗 URL do serviço:', process.env.RENDER_EXTERNAL_URL);
    }

    await criarExtensoesETabelas(pool);
    return pool;
  } catch (err) {
    console.error('❌ Falha crítica na configuração do banco:');
    console.error(err);
    process.exit(1); // Encerra o processo com erro
  }
}

async function criarExtensoesETabelas(pool) {
  const queries = [
    'CREATE EXTENSION IF NOT EXISTS pgcrypto',
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nome_completo VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      cpf VARCHAR(11) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      codigo_verificacao VARCHAR(6),
      verificado BOOLEAN DEFAULT FALSE,
      nivel_acesso INTEGER DEFAULT 1
    )`,
    // ... (mantenha suas outras queries de tabela)
  ];

  try {
    console.log('🛠 Verificando/Criando tabelas...');
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Estrutura do banco verificada com sucesso');
  } catch (err) {
    console.error('❌ Erro ao configurar o banco:');
    throw err;
  }
}

async function configurarApp(pool) {
  const app = express();

  // Middlewares essenciais
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  
  // Configuração de sessão segura para produção
  app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  // Configurações de views e arquivos estáticos
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, '../public')));

  // Rotas
  const useRoutes = require('./routes/useRoutes');
  app.use('/', useRoutes(pool));

  // Middleware de log de requisições
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Handlers de erro
  app.use((req, res) => {
    res.status(404).render('error', { 
      message: 'Página não encontrada',
      errorCode: 404
    });
  });

  app.use((err, req, res, next) => {
    console.error('💥 Erro:', err.stack);
    res.status(500).render('error', {
      message: 'Erro interno no servidor',
      errorCode: 500,
      stack: isProduction ? null : err.stack
    });
  });

  return app;
}

async function iniciarServidor() {
  try {
    const pool = await configurarBancoDeDados();
    const app = await configurarApp(pool);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      if (process.env.RENDER) {
        console.log(`🔗 Acesse: ${process.env.RENDER_EXTERNAL_URL}`);
      } else {
        console.log(`🔗 Acesse: http://localhost:${PORT}`);
      }
    });

  } catch (err) {
    console.error('❌ Falha catastrófica ao iniciar o servidor:');
    console.error(err);
    process.exit(1);
  }
}

// Inicia a aplicação
iniciarServidor();

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Erro não tratado:', err);
});