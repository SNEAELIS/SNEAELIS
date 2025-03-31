const express = require('express');
const path = require('path');
const useRoutes = require('./routes/useRoutes');
const session = require('express-session');
const initializePool = require('../config/db');
const cors = require('cors');
const XLSX = require('xlsx');

let pool;
let precificacoesSalvas = [];
let projetos = [];

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

function processarDadosPlanilha(dadosBrutos) {
  return dadosBrutos.map(item => ({
    Recursos: (row['Recursos'] || '').trim(),
    item: item.ITEM || 'Sem descrição',
    subitem: item.SUBITEM || item.ITEM || 'Sem descrição',
    codigo: item['CÓDIGO/CATMAT/CATSER/CBO'] || 'N/A',
    gnd: item.GND || 'N/A',
    uf: item.UF || 'N/A',
    modalidade: item.MODALIDADE || 'N/A',
    unidade: item.UNIDADE || 'N/A',
    valorUnitario: parseFloat(String(row['VALOR UNITÁRIO']).replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
    etapa: item['ETAPA ORÇAMENTÁRIA'] || 'N/A'
  }));
}

async function startApp() {
  pool = await initializePool();
  await habilitarPgcrypto();
  await criarTabelaUsuarios();

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(
    session({
      secret: 'segredo_super_seguranca',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
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

  // Rotas específicas antes do useRoutes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
  app.get('/api/precificacao-dados', (req, res) => {
    try {
        const valorEmenda = parseFloat(req.query.valor) || 0;
        console.log('Valor recebido na query:', valorEmenda);

        const filePath = path.resolve(__dirname, '../data/Consolidado_Preços_Esporte_Amador.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        // Log para inspecionar a planilha
        if (rawData.length > 0) {
            console.log('Nomes das colunas na planilha:', Object.keys(rawData[0]));
            console.log('Primeiros 5 itens brutos da planilha:', rawData.slice(0, 5));
        } else {
            console.log('A planilha está vazia.');
        }

        const dados = rawData.map(row => ({
            Recursos: (row['Recursos'] || '').trim() || 'Outros', // Garante que espaços sejam removidos
            item: (row['ITEM'] || 'Sem descrição').trim(),
            subitem: (row['SUBITEM'] || row['ITEM'] || 'Sem descrição').trim(),
            codigo: row['CÓDIGO/CATMAT/CATSER/CBO'] || 'N/A',
            codigoSipea: row['CÓDIGO SIPEA'] || 'N/A',
            unidade: row['UNIDADE'] || 'N/A',
            valorUnitario: parseFloat(row['VALOR UNITÁRIO']) || 0,
            uf: (row['UF'] || '').trim().toUpperCase(),
            gnd: row['GND'] || 'N/A',
            etapa: row['ETAPA ORÇAMENTÁRIA'] || 'N/A',
            modalidade: row['MODALIDADE'] || 'N/A',
            pasta: row['PASTA'] || 'N/A'
        }));

        // Log para verificar os valores únicos da coluna Recursos
        const recursosUnicos = [...new Set(dados.map(item => item.Recursos))];
        console.log('Valores únicos da coluna Recursos:', recursosUnicos);

        console.log('Dados processados (primeiros 5 itens):', dados.slice(0, 5));
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

  // Rotas personalizadas (useRoutes) por último
  app.use('/', useRoutes);

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use((req, res) => {
    console.log('Rota não encontrada:', req.originalUrl);
    res.status(404).send(`Cannot GET ${req.originalUrl}`);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('Erro ao iniciar o aplicativo:', err);
  process.exit(1);
});