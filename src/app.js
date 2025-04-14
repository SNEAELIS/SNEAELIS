// src/app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const initializePool = require('../config/db');
const useRoutes = require('./routes/useRoutes');

let pool;

async function habilitarPgcrypto(pool) {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('Extensão pgcrypto habilitada ou já existente.');
  } catch (err) {
    console.error('Erro ao habilitar pgcrypto:', err);
  }
}

async function criarTabelaUsuarios(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nome_completo VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      cpf VARCHAR(11) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      codigo_verificacao VARCHAR(6),
      verificado BOOLEAN DEFAULT FALSE,
      nivel_acesso INTEGER DEFAULT 1
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela users criada ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela users:', err);
  }
}

async function criarTabelaProjetos(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS projetos (
      id SERIAL PRIMARY KEY,
      numero_proposta VARCHAR(255) NOT NULL,
      nome_proponente VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela projetos criada ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela projetos:', err);
  }
}

async function criarTabelaPrecificacoes(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS precificacoes (
      id SERIAL PRIMARY KEY,
      protocolo VARCHAR(255) NOT NULL,
      itens JSONB NOT NULL,
      valor_total NUMERIC NOT NULL,
      valor_emenda NUMERIC NOT NULL,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER REFERENCES users(id)
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela precificacoes criada ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela precificacoes:', err);
  }
}

async function criarTabelaDocumentacoes(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS documentacoes (
      id SERIAL PRIMARY KEY,
      documento VARCHAR(255) NOT NULL,
      descricao TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela documentacoes criada ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela documentacoes:', err);
  }
}

async function criarTabelaConvenios(pool) {
  const query = `
    CREATE TABLE IF NOT EXISTS convenios (
      id SERIAL PRIMARY KEY,
      numero_convenio VARCHAR(255) NOT NULL,
      detalhes TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Tabela convenios criada ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela convenios:', err);
  }
}

async function startApp() {
  // Initialize the database pool
  try {
    pool = await initializePool();
    console.log('Database pool initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database pool:', err);
    process.exit(1);
  }

  // Setup database extensions and tables
  await habilitarPgcrypto(pool);
  await criarTabelaUsuarios(pool);
  await criarTabelaProjetos(pool);
  await criarTabelaPrecificacoes(pool);
  await criarTabelaDocumentacoes(pool);
  await criarTabelaConvenios(pool);

  const app = express();

  // Middleware setup
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'segredo_super_seguranca',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: process.env.NODE_ENV === 'production' },
    })
  );

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Serve static files
  const staticPath = path.join(__dirname, '../public');
  console.log('Serving static files from:', staticPath);
  app.use(express.static(staticPath));

  // Serve .js files with correct MIME type
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  // Use routes with the initialized pool
  app.use('/', useRoutes(pool));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // 404 handler
  app.use((req, res) => {
    console.log('Rota não encontrada:', req.originalUrl);
    res.status(404).send(`Cannot GET ${req.originalUrl}`);
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Erro interno:', err.stack);
    res.status(500).send('Erro interno no servidor');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Start the application
startApp().catch((err) => {
  console.error('Erro ao iniciar o aplicativo:', err);
  process.exit(1);
});