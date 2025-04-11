const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { cadastrarUsuario, verificarCodigo, loginUsuario } = require('../controllers/userController');
const { verificarNivelAcesso } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  // ==================== HELPER FUNCTIONS ====================
  const loadSpreadsheetData = (filePath, sheetName) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
      if (!worksheet) {
        throw new Error(`A aba "${sheetName}" não foi encontrada.`);
      }
      return xlsx.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('Erro ao carregar planilha:', error.stack);
      throw error;
    }
  };

  const groupByEtapa = (data) => {
    return data.reduce((acc, item) => {
      const key = item.etapa || 'Sem Etapa';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };

  // Verifica se o template existe
  const checkTemplateExists = (templateName) => {
    const templatePath = path.join(__dirname, `../views/${templateName}.ejs`);
    return fs.existsSync(templatePath);
  };

  // ==================== MIDDLEWARES ====================
  const checkAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login?error=Faça login para acessar');
    }
    next();
  };

  // Middleware para verificar template
  const verifyTemplate = (templateName) => (req, res, next) => {
    if (!checkTemplateExists(templateName)) {
      console.error(`Template não encontrado: ${templateName}.ejs`);
      return res.status(404).render('error', {
        message: 'Template não encontrado',
        user: req.session.user
      });
    }
    next();
  };

  // ==================== ROUTES ====================
  // Public Routes
  router.get('/', (req, res) => res.redirect('/login'));

  router.get('/login', (req, res) => {
    res.render('login', { 
      error: req.query.error,
      success: req.query.success
    });
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.redirect('/login?error=Email e senha são obrigatórios');
      }
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND senha = crypt($2, senha)',
        [email, senha]
      );
      if (result.rows.length === 0) {
        return res.redirect('/login?error=Credenciais inválidas');
      }
      req.session.user = result.rows[0];
      res.redirect('/escolher-formulario');
    } catch (error) {
      console.error('Erro no login:', error.stack);
      res.redirect('/login?error=Erro interno no servidor');
    }
  });

  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login?success=Logout realizado com sucesso');
  });

  // Protected Routes
  router.get('/escolher-formulario', checkAuth, (req, res) => {
    res.render('escolherFormulario', { 
      user: req.session.user,
      error: req.query.error 
    });
  });

  router.post('/selecionar-formulario', checkAuth, (req, res) => {
    const { tipoFormulario } = req.body;
    res.redirect(tipoFormulario ? `/${tipoFormulario}` : '/escolher-formulario');
  });

  router.get('/precificacao', checkAuth, (req, res) => {
    try {
      if (!req.query.valor) {
        return res.redirect('/escolher-formulario?erro=Valor não informado');
      }
      const valorFormatado = String(req.query.valor).replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorFormatado);
      if (isNaN(valor) || valor <= 0) {
        return res.redirect('/escolher-formulario?erro=Valor inválido ou não positivo');
      }
      
      const filePath = path.resolve(__dirname, '../../data/Consolidado_Preços_Esporte_Amador.xlsx');
      const rawData = loadSpreadsheetData(filePath, 'Sheet1');
      
      const data = rawData.map(row => ({
        codigoCatmat: row['CÓDIGO/CATMAT/CATSER/CBO'] || '',
        codigoSipea: row['CÓDIGO SIPEA'] || '',
        item: row['ITEM'] || '',
        subitem: row['SUBITEM'] || row['ITEM'] || '',
        unidade: row['UNIDADE'] || '',
        valorUnitario: parseFloat(row['VALOR UNITÁRIO (R$)']) || 0,
        uf: (row['UF'] || '').trim().toUpperCase(),
        gnd: row['GND'] || '',
        etapa: row['ETAPA ORÇAMENTÁRIA'] || '',
        modalidade: row['MODALIDADE'] || '',
        recursosHumanos: row['Recursos'] || ''
      }));
      
      res.render('precificacao', {
        valorEmenda: valor,
        valorFormatado: valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        groupedData: groupByEtapa(data),
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro na precificação:', error.stack);
      res.status(500).redirect('/escolher-formulario?erro=Erro ao processar planilha');
    }
  });

  router.get('/paginaprincipal', checkAuth, (req, res) => {
    res.render('paginaprincipal', { user: req.session.user });
  });

  router.get('/precificacao-form', checkAuth, (req, res) => {
    res.render('precificacaoForm', { 
      user: req.session.user,
      error: req.query.error 
    });
  });

  // Dynamic Form Routes com verificação de template
  const formularios = [
    { path: 'formulario-merito', template: 'formulario-merito', title: 'Formulário de Mérito' },
    { path: 'Formulario_Documentacoes', template: 'Formulario_Documentacoes', title: 'Documentações' },
    { path: 'Ficha_Frequencia', template: 'Ficha_Frequencia', title: 'Ficha de Frequência' },
    { path: 'Formulario_convenio', template: 'Formulario_convenio', title: 'Convênio' },
    { path: 'formulario-dirigente', template: 'formulario-dirigente', title: 'Dirigente' },
    { path: 'Ficha_RTMA', template: 'Ficha_RTMA', title: 'RTMA' },
    { path: 'Formulario', template: 'Formulario', title: 'Formulário Principal' }
  ];

  formularios.forEach(form => {
    router.get(`/${form.path}`, 
      checkAuth,
      verifyTemplate(form.template),
      (req, res) => {
        res.render(form.template, { 
          title: form.title,
          user: req.session.user 
        });
      }
    );
  });

  // Simulation Routes
  router.get('/simulacao', checkAuth, (req, res) => {
    res.render('simulacao', { user: req.session.user });
  });

  router.post('/simulacao/resultado', checkAuth, (req, res) => {
    const { tipo, quantidade, custo } = req.body;
    const total = parseFloat(quantidade) * parseFloat(custo);
    res.render('resultado', { 
      tipo, 
      quantidade, 
      custo, 
      total,
      user: req.session.user 
    });
  });

  // API Endpoints
  router.get('/api/pesquisa-preco', checkAuth, async (req, res) => {
    try {
      const filePath = path.resolve(__dirname, '../../data/Planilha_Custo.xlsx');
      const rawData = loadSpreadsheetData(filePath, 'Resultado (3)');
      const data = rawData.map(row => ({
        META: row['META'] || '',
        ETAPA: row['ETAPA'] || '',
        CLASSIFICACAO: row['CLASSIFICAÇÃO'] || '',
        MODALIDADE: row['MODALIDADE ESPORTIVA'] || '',
        ITEM_PADRONIZADO: row['ITEM Padronizado'] || '',
        TIPO_DESPESA: row['TIPO DE DESPESA'] || '',
        QUANTIDADE: parseInt(row['QUANTIDADE'], 10) || 0,
        VALOR_UNITARIO: parseFloat(row['VALOR UNITÁRIO']) || 0,
        UF_ENTIDADE: (row['UF_ENTIDADE'] || '').trim().toUpperCase(),
        DATA_BASE: row['DATA BASE'] || ''
      }));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro na API:', error.stack);
      res.status(500).json({ success: false, error: 'Erro ao processar planilha' });
    }
  });

  router.post('/Ficha_RTMA', checkAuth, async (req, res) => {
    try {
      const templatePath = path.join(__dirname, '../templates/Ficha_Técnica_Template.xlsx');
      const outputDir = path.join(__dirname, '../public/output');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
      const worksheet = workbook.getWorksheet(1);
      
      const fields = {
        'A3': req.body.osc,
        'A4': req.body.processo,
        'A5': req.body.termo_fomento,
      };
      
      Object.entries(fields).forEach(([cell, value]) => {
        worksheet.getCell(cell).value = value;
      });
      
      const outputPath = path.join(outputDir, `RTMA_${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(outputPath);
      
      res.download(outputPath, 'Ficha_RTMA_Preenchida.xlsx', (err) => {
        fs.unlinkSync(outputPath);
        if (err) console.error('Erro no download:', err.stack);
      });
    } catch (error) {
      console.error('Erro ao gerar RTMA:', error.stack);
      res.status(500).render('error', {
        message: 'Erro ao gerar documento',
        user: req.session.user
      });
    }
  });

  // ==================== ERROR HANDLING ====================
  router.use((err, req, res, next) => {
    console.error('Erro interno:', err.stack);
    res.status(500).render('error', {
      message: 'Erro interno no servidor',
      user: req.session.user || null
    });
  });

  router.use((req, res) => {
    res.status(404).render('error', {
      message: 'Página não encontrada',
      user: req.session.user || null
    });
  });

  return router;
};