const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');

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
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const getCorrectTemplateName = (templateName) => {
    const viewsDir = path.join(__dirname, '../views');
    console.log(`Verificando template: ${templateName}.ejs em ${viewsDir}`);
    const files = fs.readdirSync(viewsDir);
    const foundFile = files.find(file => file.toLowerCase() === `${templateName.toLowerCase()}.ejs`);
    console.log(`Template encontrado: ${foundFile || 'Nenhum'}`);
    return foundFile ? foundFile.replace('.ejs', '') : null;
  };

  // ==================== MIDDLEWARES ====================
  const checkAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login?error=Faça login para acessar');
    }
    next();
  };

  const verifyTemplate = (templateName) => (req, res, next) => {
    const correctTemplateName = getCorrectTemplateName(templateName);
    if (!correctTemplateName) {
      console.error(`Template não encontrado: ${templateName}.ejs`);
      return res.status(404).render('acesso-negado', {
        message: 'Template não encontrado',
        user: req.session.user || null,
      });
    }
    req.correctTemplateName = correctTemplateName;
    next();
  };

  // ==================== ROUTES ====================
  // Public Routes
  router.get('/', (req, res) => res.redirect('/login'));

  router.get('/login', (req, res) => {
    res.render('login', {
      error: req.query.error,
      success: req.query.success,
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
    req.session.destroy((err) => {
      if (err) console.error('Erro ao destruir sessão:', err.stack);
      res.redirect('/login?success=Logout realizado com sucesso');
    });
  });

  // Protected Routes
  router.get('/escolher-formulario', checkAuth, (req, res) => {
    res.render('escolherFormulario', {
      user: req.session.user,
      error: req.query.error,
    });
  });

  router.post('/selecionar-formulario', checkAuth, (req, res) => {
    const { tipoFormulario } = req.body;
    if (!tipoFormulario) {
      return res.redirect('/escolher-formulario?error=Selecione um formulário');
    }
    res.redirect(`/${tipoFormulario}`);
  });

  // Precificação
  router.get('/precificacao', checkAuth, (req, res) => {
    try {
      if (!req.query.valor) {
        return res.redirect('/escolher-formulario?error=Valor não informado');
      }
      const valorFormatado = String(req.query.valor).replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorFormatado);
      if (isNaN(valor) || valor <= 0) {
        return res.redirect('/escolher-formulario?error=Valor inválido ou não positivo');
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
        recursosHumanos: row['Recursos'] || '',
      }));

      res.render('precificacao', {
        valorEmenda: valor,
        valorFormatado: valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        groupedData: groupByEtapa(data),
        user: req.session.user,
      });
    } catch (error) {
      console.error('Erro na precificação:', error.stack);
      res.redirect('/escolher-formulario?error=Erro ao processar planilha');
    }
  });

  // Salvar Precificação
  router.post('/salvar-precificacao', checkAuth, express.json(), async (req, res) => {
    try {
      const { protocolo, itens, valorTotal, valorEmenda } = req.body;
      if (!protocolo || !itens || !valorTotal || !valorEmenda) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }

      await pool.query(
        'INSERT INTO precificacoes (protocolo, itens, valor_total, valor_emenda, user_id) VALUES ($1, $2, $3, $4, $5)',
        [protocolo, itens, valorTotal, valorEmenda, req.session.user.id]
      );

      res.json({ mensagem: 'Precificação salva com sucesso!', protocolo });
    } catch (error) {
      console.error('Erro ao salvar precificação:', error.stack);
      res.status(500).json({ error: 'Erro ao salvar precificação.' });
    }
  });

  // Consultar Protocolo
  router.get('/consulta-protocolo', checkAuth, async (req, res) => {
    try {
      const protocolo = req.query.protocolo;
      if (!protocolo) {
        return res.status(400).json({ error: 'Protocolo é obrigatório.' });
      }

      const result = await pool.query(
        'SELECT * FROM precificacoes WHERE protocolo = $1 AND user_id = $2',
        [protocolo, req.session.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Protocolo não encontrado.' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao consultar protocolo:', error.stack);
      res.status(500).json({ error: 'Erro ao consultar protocolo.' });
    }
  });

  // Exportar Protocolos
  router.get('/exportar-protocolos', checkAuth, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM precificacoes WHERE user_id = $1',
        [req.session.user.id]
      );

      const precificacoes = result.rows;
      const csv = precificacoes.map(p =>
        `${p.protocolo},${p.valor_emenda},${p.valor_total},${p.data.toISOString()}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=protocolos.csv');
      res.send('Protocolo,Valor Emenda,Valor Gasto,Data\n' + csv);
    } catch (error) {
      console.error('Erro ao exportar protocolos:', error.stack);
      res.status(500).send('Erro ao exportar protocolos.');
    }
  });

  // Formulário de Mérito
  router.get('/formulario-merito', checkAuth, verifyTemplate('Formulario-merito'), (req, res) => {
    res.render(req.correctTemplateName, {
      title: 'Formulário de Mérito',
      user: req.session.user,
    });
  });

  // Formulários Dinâmicos
  const formularios = [
    { path: 'formulario-documentacoes', template: 'Formulario_Documentacoes', title: 'Documentações' },
    { path: 'formulario-convenio', template: 'Formulario_convenio', title: 'Convênio' },
    { path: 'ficha-frequencia', template: 'Ficha_Frequencia', title: 'Ficha de Frequência' },
    { path: 'formulario-dirigente', template: 'formulario-dirigente', title: 'Dirigente' },
    { path: 'ficha-rtma', template: 'Ficha_RTMA', title: 'RTMA' },
    { path: 'formulario-principal', template: 'Formulario', title: 'Formulário Principal' },
    { path: 'precificacao-form', template: 'precificacaoForm', title: 'Formulário de Precificação' },
  ];

  formularios.forEach(form => {
    router.get(`/${form.path}`, checkAuth, verifyTemplate(form.template), (req, res) => {
      res.render(req.correctTemplateName, {
        title: form.title,
        user: req.session.user,
        error: req.query.error,
        success: req.query.success,
      });
    });
  });

  router.post('/gerar-pdf-merito', checkAuth, async (req, res) => {
    try {
      const formData = req.body;
      const doc = new jsPDF();
      const config = {
        marginLeft: 15,
        pageHeight: 280,
        footerSpace: 30,
      };

      let currentY = 30;

      // Cabeçalho
      doc.setFontSize(16);
      doc.setTextColor(0, 48, 135);
      doc.text('MINISTÉRIO DO ESPORTE', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('FORMULÁRIO DE MÉRITO', 105, 25, { align: 'center' });
      doc.setDrawColor(0, 48, 135);
      doc.line(15, 28, 195, 28);

      // Seções do formulário
      const sections = [
        { title: '4.1 ESTRUTURA DAS AULAS', content: formData.desenvolvimento?.estruturaAulas },
        { title: '4.2 METODOLOGIA DE ENSINO', content: formData.desenvolvimento?.metodologiaEnsino },
        { title: '4.3 DETALHAMENTO DAS MODALIDADES', content: formData.desenvolvimento?.detalhamentoModalidades },
        { title: '4.4 AVALIAÇÃO E PROGRESSO', content: formData.desenvolvimento?.avaliacaoProgresso },
        { title: '4.5 ACOMPANHAMENTO E MONITORAMENTO', content: formData.desenvolvimento?.acompanhamento },
        { title: '4.6 CONCLUSÃO', content: formData.desenvolvimento?.conclusao },
      ];

      sections.forEach(section => {
        doc.setFontSize(12);
        doc.text(section.title, config.marginLeft, currentY);
        currentY += 5;
        doc.setFontSize(10);
        doc.text(section.content || `${section.title.split(' ')[1]} não informado`,
          config.marginLeft + 5, currentY);
        currentY += 10;
      });

      // Rodapé com assinatura
      const spaceNeeded = 30;
      if (currentY + spaceNeeded > config.pageHeight - config.footerSpace) {
        doc.addPage();
        currentY = 20;
      }

      const date = new Date();
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

      doc.text(`Estado/UF, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`,
        105, config.pageHeight - 20, { align: 'center' });

      doc.text("NOME DO REPRESENTANTE LEGAL DA ENTIDADE", 105, config.pageHeight - 10, { align: 'center' });
      doc.text("Dirigente", 105, config.pageHeight - 5, { align: 'center' });

      // Envia o PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Projeto_Tecnico_Esportivo.pdf');
      res.send(doc.output());
    } catch (error) {
      console.error('Erro ao gerar PDF:', error.stack);
      res.status(500).json({ success: false, error: 'Erro ao gerar PDF' });
    }
  });

  // Submissão de Formulário de Documentações
  router.post('/submit-documentacoes', checkAuth, async (req, res) => {
    try {
      const { documento, descricao } = req.body;
      if (!documento) {
        return res.redirect('/formulario-documentacoes?error=Documento é obrigatório');
      }
      await pool.query(
        'INSERT INTO documentacoes (documento, descricao, user_id) VALUES ($1, $2, $3)',
        [documento, descricao || '', req.session.user.id]
      );
      res.redirect('/formulario-documentacoes?success=Documento salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar documentação:', error.stack);
      res.redirect('/formulario-documentacoes?error=Erro ao salvar documento');
    }
  });

  // Submissão de Formulário de Convênio
  router.post('/submit-convenio', checkAuth, async (req, res) => {
    try {
      const { numero_convenio, detalhes } = req.body;
      if (!numero_convenio) {
        return res.redirect('/formulario-convenio?error=Número do convênio é obrigatório');
      }
      await pool.query(
        'INSERT INTO convenios (numero_convenio, detalhes, user_id) VALUES ($1, $2, $3)',
        [numero_convenio, detalhes || '', req.session.user.id]
      );
      res.redirect('/formulario-convenio?success=Convênio salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar convênio:', error.stack);
      res.redirect('/formulario-convenio?error=Erro ao salvar convênio');
    }
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
        DATA_BASE: row['DATA BASE'] || '',
      }));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Erro na API:', error.stack);
      res.status(500).json({ success: false, error: 'Erro ao processar planilha' });
    }
  });

  // Ficha RTMA
  router.post('/ficha-rtma', checkAuth, async (req, res) => {
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
      res.redirect('/ficha-rtma?error=Erro ao gerar documento');
    }
  });

  // ==================== ERROR HANDLING ====================
  router.use((err, req, res, next) => {
    console.error('Erro interno:', err.stack);
    res.status(500).render('acesso-negado', {
      message: 'Erro interno no servidor',
      user: req.session.user || null,
    });
  });

  router.use((req, res) => {
    res.status(404).render('acesso-negado', {
      message: 'Página não encontrada',
      user: req.session.user || null,
    });
  });

  return router;
};