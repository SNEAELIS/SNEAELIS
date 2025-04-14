const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const XLSX = require('xlsx');
const initializePool = require('../config/db'); // Import from db.js
const useRoutes = require('./routes/useRoutes'); // Import useRoutes as a factory function

// Global variables
let pool;
let projetos = [];

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
  await criarTabelaPrecificacoes(pool); // Add the new table

  const app = express();

  // Middleware setup
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(
    session({
      secret: 'segredo_super_seguranca',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Set to true if using HTTPS
    })
  );

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, '../public')));

  // Serve .js files with correct MIME type
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  // API Routes
  app.get('/api/planilha', async (req, res) => {
    try {
      const filePath = path.resolve(__dirname, '../data/Planilha_Custo.xlsx');
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const dados = XLSX.utils.sheet_to_json(worksheet);
      res.json({
        success: true,
        data: dados,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao ler planilha:', error);
      res.status(500).json({ success: false, error: 'Erro ao ler planilha' });
    }
  });

  app.get('/api/projetos/:proposalNumber', (req, res) => {
    const { proposalNumber } = req.params;
    const projetosData = {
      "222": { proposalNumber: "222", objeto: "Evento Esportivo", status: "Aprovado" },
      "333": { proposalNumber: "333", objeto: "Projeto Cultural", status: "Em Análise" },
    };
    const projeto = projetosData[proposalNumber];
    if (projeto) res.json(projeto);
    else res.status(404).json({ error: "Projeto não encontrado." });
  });

  app.get('/buscar-cnpj/:cnpj', async (req, res) => {
    const { cnpj } = req.params;
    try {
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  });

  app.post('/salvar-projeto', (req, res) => {
    const { numeroProposta, nomeProponente } = req.body;
    if (!numeroProposta || !nomeProponente) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }
    const novoProjeto = { id: Date.now().toString(), numeroProposta, nomeProponente };
    projetos.push(novoProjeto);
    res.status(201).json({ message: "Projeto salvo!", projeto: novoProjeto });
  });

  app.get('/listar-projetos', (req, res) => res.json(projetos));

  app.get('/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err.message);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
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