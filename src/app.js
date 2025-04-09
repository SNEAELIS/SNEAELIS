const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const XLSX = require('xlsx');
const initializePool = require('../config/db'); // Import from db.js
const useRoutes = require('./routes/useRoutes'); // Import useRoutes as a factory function

// Global variables
let pool;
let precificacoesSalvas = [];
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

function processarDadosPlanilha(dadosBrutos) {
  return dadosBrutos.map(item => ({
    categoria: item.Recursos,
    item: item.ITEM || 'Sem descrição',
    subitem: item.SUBITEM || item.ITEM || 'Sem descrição',
    codigo: item['CÓDIGO/CATMAT/CATSER/CBO'] || 'N/A',
    gnd: item.GND || 'N/A',
    uf: item.UF || 'N/A',
    modalidade: item.MODALIDADE || 'N/A',
    unidade: item.UNIDADE || 'N/A',
    valorUnitario: parseFloat(item['VALOR UNITÁRIO (R$)']) || 0,
    etapa: item['ETAPA ORÇAMENTÁRIA'] || 'N/A'
  }));
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
  app.get('/api/precificacao-dados', (req, res) => {
    try {
      const valorEmenda = parseFloat(req.query.valor) || 0;
      const filePath = path.resolve(__dirname, '../data/Consolidado_Preços_Esporte_Amador.xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      const dados = rawData.map(row => {
        let valorUnitario = row['VALOR UNITÁRIO'];
        if (typeof valorUnitario === 'string') {
          valorUnitario = valorUnitario.replace(/[^\d,.]/g, '').replace(',', '.').replace(/\.(?=.*\.)/g, '');
        }
        valorUnitario = parseFloat(valorUnitario) || 0;

        return {
          Recursos: row['Recursos '] || 'Sem categoria',
          ITEM: row['ITEM'] || 'Sem descrição',
          SUBITEM: row['SUBITEM'] || row['ITEM'] || 'Sem descrição',
          CODIGO: row['CÓDIGO/CATMAT/CATSER/CBO'] || 'N/A',
          CODIGO_SIPEA: row['CÓDIGO SIPEA'] || 'N/A',
          UNIDADE: row['UNIDADE'] || 'N/A',
          VALOR_UNITARIO: valorUnitario,
          UF: row['UF'] || 'N/A',
          GND: row['GND'] || 'N/A',
          ETAPA: row['ETAPA ORÇAMENTÁRIA'] || 'N/A',
          MODALIDADE: row['MODALIDADE'] || 'N/A',
          PASTA: row['PASTA'] || 'N/A'
        };
      });

      res.json({ dados, valorEmenda });
    } catch (error) {
      console.error('Erro ao carregar dados da precificação:', error);
      res.status(500).json({ dados: [], valorEmenda: 0 });
    }
  });

  app.post('/salvar-precificacao', express.json(), (req, res) => {
    const { protocolo, itens, valorTotal, valorEmenda } = req.body;
    precificacoesSalvas.push({ protocolo, itens, valorTotal, valorEmenda, data: new Date() });
    res.json({ mensagem: 'Precificação salva com sucesso!', protocolo });
  });

  app.get('/consulta-protocolo', (req, res) => {
    const protocolo = req.query.protocolo;
    const precificacao = precificacoesSalvas.find(p => p.protocolo === protocolo);
    if (precificacao) {
      res.json(precificacao);
    } else {
      res.status(404).send('Protocolo não encontrado.');
    }
  });

  app.get('/exportar-protocolos', (req, res) => {
    const csv = precificacoesSalvas.map(p => 
      `${p.protocolo},${p.valorEmenda},${p.valorTotal},${p.data.toISOString()}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=protocolos.csv');
    res.send('Protocolo,Valor Emenda,Valor Gasto,Data\n' + csv);
  });

  app.get('/api/planilha', async (req, res) => {
    try {
      const filePath = path.resolve(__dirname, '../data/Planilha_Custo.xlsx');
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const dados = XLSX.utils.sheet_to_json(worksheet);
      res.json({
        success: true,
        data: processarDadosPlanilha(dados),
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