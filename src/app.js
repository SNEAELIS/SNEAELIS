// src/app.js
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
    const pool = await initializePool();
    console.log('✅ Pool de conexão com o banco inicializado');

    // Criar extensões e tabelas necessárias
    await criarExtensoesETabelas(pool);
    return pool;
  } catch (err) {
    console.error('❌ Falha na configuração do banco:', err);
    throw err;
  }
}

async function criarExtensoesETabelas(pool) {
  const queries = [
    // Extensão pgcrypto
    'CREATE EXTENSION IF NOT EXISTS pgcrypto',
    
    // Tabela de usuários
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
    
    // Tabela de projetos
    `CREATE TABLE IF NOT EXISTS projetos (
      id SERIAL PRIMARY KEY,
      numero_proposta VARCHAR(255) NOT NULL,
      nome_proponente VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabela de precificações
    `CREATE TABLE IF NOT EXISTS precificacoes (
      id SERIAL PRIMARY KEY,
      protocolo VARCHAR(255) NOT NULL,
      itens JSONB NOT NULL,
      valor_total NUMERIC NOT NULL,
      valor_emenda NUMERIC NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER REFERENCES users(id)
    )`,
    
    // Tabela de documentações
    `CREATE TABLE IF NOT EXISTS documentacoes (
      id SERIAL PRIMARY KEY,
      documento VARCHAR(255) NOT NULL,
      descricao TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tabela de convênios
    `CREATE TABLE IF NOT EXISTS convenios (
      id SERIAL PRIMARY KEY,
      numero_convenio VARCHAR(255) NOT NULL,
      detalhes TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Tabelas e extensões verificadas/criadas');
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
    throw err;
  }
}

async function configurarApp(pool) {
  const app = express();

  // Configuração de middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  
  // Configuração de sessão
  app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo-desenvolvimento',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
  }));

  // Configuração do view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Servir arquivos estáticos
  const staticPath = path.join(__dirname, '../public');
  app.use(express.static(staticPath));
  console.log(`📁 Servindo arquivos estáticos de: ${staticPath}`);

  // Middleware para tipo MIME correto de JS
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  // Configuração de rotas
  const useRoutes = require('./routes/useRoutes');
  app.use('/', useRoutes(pool));

  // Middleware de log
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Handler para 404
  app.use((req, res) => {
    res.status(404).render('error', { 
      message: 'Página não encontrada',
      errorCode: 404
    });
  });

  // Handler de erros
  app.use((err, req, res, next) => {
    console.error('💥 Erro:', err.stack);
    res.status(500).render('error', {
      message: 'Erro interno no servidor',
      errorCode: 500
    });
  });

  return app;
}

async function iniciarServidor() {
  try {
    // Configuração do banco de dados
    const pool = await configurarBancoDeDados();

    // Configuração do app Express
    const app = await configurarApp(pool);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🔗 Acesse: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

// Iniciar aplicação
iniciarServidor();