const express = require('express');
const path = require('path');
const useRoutes = require('./routes/useRoutes');
const session = require('express-session');
const getPool = require('../config/db'); // Importa a função para obter o pool dinâmico
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

(async () => {
  pool = getPool(); // Obtemos o pool configurado dinamicamente
  try {
    await habilitarPgcrypto();
    await criarTabelaUsuarios();
  } catch (err) {
    console.error('Erro ao configurar o banco de dados:', err);
    process.exit(1);
  }
})();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: 'segredo_super_seguranca',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);


// Configuração do EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Rota para buscar projeto por número da proposta
app.get('/api/projetos/:proposalNumber', (req, res) => {
  const { proposalNumber } = req.params;

  // Simulação de busca no banco de dados
  const projetos = {
      "222": { proposalNumber: "222", objeto: "Evento Esportivo", status: "Aprovado" },
      "333": { proposalNumber: "333", objeto: "Projeto Cultural", status: "Em Análise" },
  };

  const projeto = projetos[proposalNumber];

  if (projeto) {
      res.json(projeto);
  } else {
      res.status(404).json({ error: "Projeto não encontrado." });
  }
});

app.get('/buscar-cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  console.log(`Buscando dados para o CNPJ: ${cnpj}`);

  try {
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
      console.log(`Status da resposta da API externa: ${response.status}`);
      
      if (!response.ok) {
          throw new Error(`Erro na API externa: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
  } catch (error) {
      console.error('Erro ao buscar dados da API externa:', error);
      res.status(500).json({ error: 'Erro ao buscar os dados da entidade.' });
  }
});
app.use('/', useRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Rota para buscar dados do banco
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios'); // Ajuste o nome da tabela
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar dados:', err.message);
    res.status(500).json({ error: 'Erro ao buscar dados do banco remoto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
