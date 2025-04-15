const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');
const xlsx = require('xlsx');

module.exports = (pool) => {
  const router = express.Router();

  // Configurações
  const DATA_DIR = path.join(__dirname, '../../data');

  // Helper Functions
  const loadSpreadsheetData = (filePath, sheetName) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
      return xlsx.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('Erro ao carregar planilha:', error);
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

  // Lista de Formulários
  const FORMULARIOS = [
    { path: 'formulario-documentacoes', template: 'Formulario_Documentacoes', title: 'Documentações' },
    { path: 'formulario-convenio', template: 'Formulario_convenio', title: 'Convênio' },
    { path: 'ficha-frequencia', template: 'Ficha_Frequencia', title: 'Ficha de Frequência' },
    { path: 'formulario-dirigente', template: 'formulario-dirigente', title: 'Dirigente' },
    { path: 'ficha-rtma', template: 'Ficha_RTMA', title: 'RTMA' },
    { path: 'formulario-principal', template: 'Formulario', title: 'Formulário Principal' },
    { path: 'precificacao-form', template: 'precificacaoForm', title: 'Formulário de Precificação' },
    { path: 'formulario-merito', template: 'formulario-merito', title: 'Formulário de Mérito' }
  ];

  // Rota Principal
  router.get('/', (req, res) => {
    res.render('escolherFormulario', {
      user: req.session.user || null,
      error: req.query.error,
      success: req.query.success
    });
  });
// Processar Seleção de Formulário
router.post('/selecionar-formulario', (req, res) => {
  const { tipoFormulario } = req.body;

  if (!tipoFormulario) {
    return res.redirect('/?error=Selecione um formulário');
  }

  const form = FORMULARIOS.find(f => f.path === tipoFormulario);

  if (!form) {
    return res.redirect('/?error=Formulário inválido');
  }

  res.redirect(`/${form.path}`);
});

// Rotas dos Formulários
FORMULARIOS.forEach(form => {
  router.get(`/${form.path}`, (req, res) => {
    res.render(form.template, {
      title: form.title,
      error: req.query.error,
      success: req.query.success
    });
  });
});

// Precificação
router.get('/precificacao', (req, res) => {
  try {
    if (!req.query.valor) {
      return res.redirect('/?error=Valor não informado');
    }

    const valor = parseFloat(req.query.valor);
    if (isNaN(valor) || valor <= 0) {
      return res.redirect('/?error=Valor inválido');
    }

    const filePath = path.join(DATA_DIR, 'Consolidado_Preços_Esporte_Amador.xlsx');
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
      groupedData: groupByEtapa(data)
    });
  } catch (error) {
    console.error('Erro na precificação:', error);
    res.redirect('/?error=Erro ao carregar dados');
  }
});

// Gerar PDF do Formulário de Mérito
router.post('/gerar-pdf-merito', (req, res) => {
  try {
    const formData = req.body;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(0, 48, 135);
    doc.text('MINISTÉRIO DO ESPORTE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('FORMULÁRIO DE MÉRITO', 105, 25, { align: 'center' });
    doc.setDrawColor(0, 48, 135);
    doc.line(15, 28, 195, 28);

    const sections = [
      { title: '4.1 ESTRUTURA DAS AULAS', content: formData.estruturaAulas || 'Não informado' },
      { title: '4.2 METODOLOGIA DE ENSINO', content: formData.metodologiaEnsino || 'Não informado' },
      { title: '4.3 DETALHAMENTO DAS MODALIDADES', content: formData.detalhamentoModalidades || 'Não informado' },
      { title: '4.4 AVALIAÇÃO E PROGRESSO', content: formData.avaliacaoProgresso || 'Não informado' },
      { title: '4.5 ACOMPANHAMENTO E MONITORAMENTO', content: formData.acompanhamento || 'Não informado' },
      { title: '4.6 CONCLUSÃO', content: formData.conclusao || 'Não informado' }
    ];

    let currentY = 40;
    sections.forEach(section => {
      doc.setFontSize(12);
      doc.text(section.title, 15, currentY);
      currentY += 8;
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(section.content, 180);
      doc.text(splitText, 20, currentY);
      currentY += splitText.length * 7 + 10;
    });

    const date = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    doc.text(`Estado/UF, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`, 105, 280, { align: 'center' });
    doc.text("NOME DO REPRESENTANTE LEGAL DA ENTIDADE", 105, 285, { align: 'center' });
    doc.text("Dirigente", 105, 290, { align: 'center' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Formulario_Merito.pdf');
    res.send(doc.output());
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).send('Erro ao gerar PDF');
  }
});

// Rota para Ficha RTMA (Excel)
router.post('/ficha-rtma', async (req, res) => {
  try {
    const templatePath = path.join(DATA_DIR, 'Ficha_Técnica_Template.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);

    worksheet.getCell('A3').value = req.body.osc || '';
    worksheet.getCell('A4').value = req.body.processo || '';
    worksheet.getCell('A5').value = req.body.termo_fomento || '';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Ficha_RTMA.xlsx');
    await workbook.xlsx.write(res);
  } catch (error) {
    console.error('Erro ao gerar RTMA:', error);
    res.status(500).send('Erro ao gerar ficha técnica');
  }
});

// Rota de Erro 404
router.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

// Exportação corrigida
return router;
};