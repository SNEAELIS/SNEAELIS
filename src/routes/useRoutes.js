const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { cadastrarUsuario, verificarCodigo, loginUsuario } = require('../controllers/userController');
const { verificarNivelAcesso } = require('../middleware/auth');

// Helper functions
const loadSpreadsheetData = (filePath, sheetName) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`A aba "${sheetName}" não foi encontrada.`);
    }

    return xlsx.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Erro ao carregar planilha:', error);
    throw error;
  }
};

const groupByMeta = (data) => {
  return data.reduce((acc, curr) => {
    const meta = curr.meta || 'Sem Meta';
    if (!acc[meta]) {
      acc[meta] = [];
    }
    acc[meta].push(curr);
    return acc;
  }, {});
};

// Rotas Públicas
router.get('/', (req, res) => res.redirect('/escolher-formulario'));
router.get('/escolher-formulario', (req, res) => res.render('escolherFormulario'));

router.post('/selecionar-formulario', (req, res) => {
  const { tipoFormulario } = req.body;
  res.redirect(tipoFormulario ? `/${tipoFormulario}` : '/escolher-formulario');
});

router.get('/precificacao', (req, res) => {
  console.log('Acessando a rota /precificacao com query:', req.query);
  try {
      if (!req.query.valor) {
          return res.redirect('/escolher-formulario?erro=Valor não informado');
      }
      const valorFormatado = String(req.query.valor)
          .replace(/\./g, '')
          .replace(',', '.');
      const valor = parseFloat(valorFormatado);
      if (isNaN(valor)) {
          return res.redirect('/escolher-formulario?erro=Valor inválido. Use números (ex: 1000 ou 1000,50)');
      }
      if (valor <= 0) {
          return res.redirect('/escolher-formulario?erro=O valor deve ser maior que zero');
      }

      // Novo caminho do arquivo
      const filePath = path.resolve(__dirname, '../../data/Consolidado_Preços_Esporte_Amador.xlsx');
      const rawData = loadSpreadsheetData(filePath, 'Sheet1'); // Substitua 'Sheet1' pelo nome real da aba, se diferente

      // Mapeamento dos dados com as novas colunas
      const data = rawData.map(row => ({
          codigoCatmat: row['CÓDIGO/CATMAT/CATSER/CBO'] || '',
          codigoSipea: row['CÓDIGO SIPEA'] || '',
          item: row['ITEM'] || '',
          subitem: row['SUBITEM'] || '',
          unidade: row['UNIDADE'] || '',
          valorUnitario: parseFloat(row['VALOR UNITÁRIO (R$)']) || 0,
          uf: (row['UF'] || '').trim().toUpperCase(),
          gnd: row['GND'] || '',
          etapa: row['ETAPA ORÇAMENTÁRIA'] || '',
          modalidade: row['MODALIDADE'] || '',
          recursosHumanos: row['Recursos'] || ''
      }));

      // Agrupamento dos dados (exemplo: por 'etapa')
      const groupedData = groupByEtapa(data); // Ajuste a função de agrupamento conforme necessário

      res.render('precificacao', {
          valorEmenda: valor,
          valorFormatado: valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
          }),
          groupedData: groupedData
      });
  } catch (error) {
      console.error('Erro na rota /precificacao:', error);
      res.status(500).redirect('/escolher-formulario?erro=Erro interno no servidor');
  }
});

// Função de agrupamento por 'etapa' (exemplo)
function groupByEtapa(data) {
  return data.reduce((acc, item) => {
      const key = item.etapa || 'Sem Etapa';
      if (!acc[key]) {
          acc[key] = [];
      }
      acc[key].push(item);
      return acc;
  }, {});
}
// Rotas Protegidas
router.get('/paginaprincipal', verificarNivelAcesso(1), (req, res) => {
  const user = req.session.user;
  res.render('paginaprincipal', { user });
});

router.get('/pre-page2', verificarNivelAcesso(1), (req, res) => {
  res.render('pre-page2', { user: req.session.user });
});

router.get('/formalizacao', verificarNivelAcesso(1), (req, res) => {
  res.render('formalizacao', { nivel_acesso: req.session.nivel_acesso });
});

router.get('/acompanhamento', verificarNivelAcesso(2), (req, res) => {
  res.render('acompanhamento', { nivel_acesso: req.session.nivel_acesso });
});

router.get('/admin-dashboard', verificarNivelAcesso(3), (req, res) => {
  res.render('admin-dashboard', { nivel_acesso: req.session.nivel_acesso });
});

router.get('/dashboard-pesquisa', verificarNivelAcesso(1), (req, res) => {
  res.render('dashboard-pesquisa', { user: req.session.user });
});

// Rotas de Formulários
router.get('/formulario-merito', (req, res) => res.render('Formulario-merito'));
router.get('/Formulario_Documentacoes', (req, res) => res.render('Formulario_Documentacoes'));
router.get('/Ficha_Frequencia', (req, res) => res.render('Ficha_Frequencia'));
router.get('/Formulario_convenio', (req, res) => res.render('Formulario_convenio'));
router.get('/formulario-dirigente', (req, res) => res.render('formulario-dirigente'));
router.get('/Ficha_RTMA', (req, res) => res.render('Ficha_RTMA'));
router.get('/Formulario', (req, res) => res.render('Formulario'));

// Rotas de Simulação
router.get('/simulacao', (req, res) => res.render('simulacao'));

router.post('/simulacao/resultado', (req, res) => {
  const { tipo, quantidade, custo } = req.body;
  const total = parseFloat(quantidade) * parseFloat(custo);
  res.render('resultado', { tipo, quantidade, custo, total });
});

// API Endpoints
router.get('/api/pesquisa-preco', (req, res) => {
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

    res.json(data);
  } catch (error) {
    console.error('Erro na API de pesquisa de preço:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para processar Ficha RTMA
router.post('/Ficha_RTMA', async (req, res) => {
  try {
    const formData = req.body;
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'templates', 'Ficha_Técnica_Template.xlsx');

    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Planilha1');

    // Preenche os dados no template
    const mappings = {
      'A3': formData.osc,
      'A4': formData.processo,
      'A5': formData.termo_fomento,
      'G5': formData.termo_sei,
      'H5': formData.dou_sei,
      'A8': formData.data_monitoramento,
      'B8': formData.responsavel_monitoramento,
      'C8': formData.local_monitoramento,
      'A12': formData.atividades,
      'A14': formData.resultados,
      'A18': formData.dificuldades,
      'A20': formData.observacoes
    };

    Object.entries(mappings).forEach(([cell, value]) => {
      worksheet.getCell(cell).value = value;
    });

    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'Ficha_RTMA_Preenchida.xlsx');
    await workbook.xlsx.writeFile(outputPath);

    res.download(outputPath, 'Ficha_RTMA_Preenchida.xlsx', (err) => {
      if (err) console.error('Erro ao enviar arquivo:', err);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Erro ao processar Ficha RTMA:', error);
    res.status(500).render('error', { 
      message: 'Erro ao gerar a Ficha RTMA. Por favor, tente novamente.' 
    });
  }
});

module.exports = router;