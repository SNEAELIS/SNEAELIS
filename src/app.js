const express = require('express');
const path = require('path');
const useRoutes = require('./routes/useRoutes');
const session = require('express-session');
const initializePool = require('../config/db');
const cors = require('cors');

let pool;

async function habilitarPgcrypto() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('Extensão pgcrypto habilitada ou já existente.');
  } catch (err) {
    console.error('Erro ao habilitar pgcrypto:', err);
  }
}

async function criarTabelaUsuarios() {
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

// Função principal para inicializar o app
async function startApp() {
  pool = await initializePool(); // Aguarda o pool estar pronto
  await habilitarPgcrypto();
  await criarTabelaUsuarios();

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      secret: 'segredo_super_seguranca',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // Use true em produção com HTTPS
    })
  );

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  app.get('/api/projetos/:proposalNumber', (req, res) => {
    const { proposalNumber } = req.params;
    const projetos = {
      "222": { proposalNumber: "222", objeto: "Evento Esportivo", status: "Aprovado" },
      "333": { proposalNumber: "333", objeto: "Projeto Cultural", status: "Em Análise" },
    };
    const projeto = projetos[proposalNumber];
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

  app.use('/', useRoutes);
  app.use(cors());

  let projetos = [];
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

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Inicia o aplicativo
startApp().catch((err) => {
  console.error('Erro ao iniciar o aplicativo:', err);
  process.exit(1);
});