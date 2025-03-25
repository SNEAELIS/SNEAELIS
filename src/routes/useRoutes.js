const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const path = require('path');
const { cadastrarUsuario, verificarCodigo, loginUsuario } = require('../controllers/userController');
const { verificarNivelAcesso } = require('../middleware/auth');
const app = require('../app')

router.get('/', (req, res) => {
  res.redirect('/Formulario_Documentacoes'); // Redireciona para Formulario_Documentacoes
});

// Rota para renderizar a página de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro'); // Renderiza a view cadastro.ejs
});

// Rota para processar o cadastro
router.post('/cadastro', cadastrarUsuario);

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
  res.render('login', { error: null }); // Certifique-se de passar a variável `error` como null inicialmente
});

// Rota para processar o login
router.post('/login', loginUsuario);

// Rota para renderizar a página de verificação
router.get('/verificar', (req, res) => {
  res.render('verificar'); // Renderiza a página verificar.ejs
});


// Rota para verificar o código
router.post('/verificar-codigo', verificarCodigo);

// Rota para renderizar a página principal
router.get('/paginaprincipal', verificarNivelAcesso(1), (req, res) => {
  const user = req.session.user; // Obtém o usuário da sessão
  if (!user) {
    return res.redirect('/login'); // Redireciona para login se o usuário não estiver na sessão
  }
  res.render('paginaprincipal', { user }); // Envia o usuário para a view
});

// Rotas protegidas por níveis de acesso
router.get('/formalizacao', verificarNivelAcesso(1), (req, res) => {
  res.render('formalizacao', { nivel_acesso: req.session.nivel_acesso });
});

router.get('/acompanhamento', verificarNivelAcesso(2), (req, res) => {
  res.render('acompanhamento', { nivel_acesso: req.session.nivel_acesso });
});

router.get('/admin-dashboard', verificarNivelAcesso(3), (req, res) => {
  console.log("Acessando /admin-dashboard");
  res.render('admin-dashboard', { nivel_acesso: req.session.nivel_acesso });
});

// Rota para renderizar a página pre-page2
router.get('/pre-page2', (req, res) => {
  const user = req.session.user; // Supondo que os dados do usuário estejam na sessão
  if (user) {
    res.render('pre-page2', { user });
  } else {
    res.redirect('/login'); // Redireciona para o login se o usuário não estiver autenticado
  }
});

router.get('/formulario-merito', (req, res) => {
  res.render('Formulario-merito');
});

router.get('/Formulario_Documentacoes', (req, res) =>{
  res.render('Formulario_Documentacoes');
});

router.get('/Ficha_Frequencia', (req, res) => {
  res.render('Ficha_Frequencia'); // Renderiza o template EJS com dados do usuário
});

router.get('/Formulario_convenio', (req, res) => {
  res.render('Formulario_convenio');
});

router.get('/formulario-dirigente', (req, res) => {
  res.render('formulario-dirigente'); // Certifique-se de que o arquivo 'formulario-dirigente.ejs' existe em 'views'
});

router.get('/simulacao', (req, res) => {
  res.render('simulacao'); // Renderiza a página simulacao.ejs
});

router.post('/simulacao/resultado', (req, res) => {
  const { tipo, quantidade, custo } = req.body;
  const total = parseFloat(quantidade) * parseFloat(custo);

  res.render('resultado', { tipo, quantidade, custo, total });
});

router.get('/dashboard-pesquisa', (req, res) => {
  const user = req.session.user; // Verifica o usuário na sessão
  if (!user) {
    return res.redirect('/login'); // Redireciona para login se não estiver autenticado
  }
  res.render('dashboard-pesquisa', { user }); // Renderiza a página com os dados do usuário
});

// Rota para renderizar a página do formulário Ficha RTMA
router.get('/Ficha_RTMA', (req, res) => {
  res.render('Ficha_RTMA'); // Certifique-se de que o arquivo EJS existe
});

router.get('/Formulario', (req, res) => {
  res.render('Formulario'); // Certifique-se que o arquivo .ejs está em 'views'
});


router.post('/Ficha_RTMA', async (req, res) => {
  const formData = req.body;

  // Carregar a planilha original
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, 'templates', 'Ficha_Técnica_Template.xlsx');
  
  try {
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Planilha1');

    // Preencher os campos na planilha
    worksheet.getCell('A3').value = formData.osc; // OSC
    worksheet.getCell('A4').value = formData.processo; // Processo
    worksheet.getCell('A5').value = formData.termo_fomento; // Termo de Fomento
    worksheet.getCell('G5').value = formData.termo_sei; // Termo (SEI)
    worksheet.getCell('H5').value = formData.dou_sei; // DOU (SEI)

    worksheet.getCell('A8').value = formData.data_monitoramento; // Data do Monitoramento
    worksheet.getCell('B8').value = formData.responsavel_monitoramento; // Responsável
    worksheet.getCell('C8').value = formData.local_monitoramento; // Local

    worksheet.getCell('A12').value = formData.atividades; // Atividades Realizadas
    worksheet.getCell('A14').value = formData.resultados; // Resultados Obtidos

    worksheet.getCell('A18').value = formData.dificuldades; // Dificuldades
    worksheet.getCell('A20').value = formData.observacoes; // Observações

    // Salvar e enviar o arquivo para download
    const outputPath = path.join(__dirname, 'output', 'Ficha_RTMA_Preenchida.xlsx');
    await workbook.xlsx.writeFile(outputPath);

    res.download(outputPath, 'Ficha_RTMA_Preenchida.xlsx', () => {
      fs.unlinkSync(outputPath); // Remove o arquivo após download
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao gerar a planilha.');
  }
});

router.get('/api/pesquisa-preco', (req, res) => {
  try {
    const filePath = path.resolve(__dirname, '../../data/Planilha_Custo.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'Resultado (3)';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`A aba "${sheetName}" não foi encontrada.`);
    }

    // Conversão dos dados para JSON
    const data = xlsx.utils.sheet_to_json(worksheet).map(row => ({
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

    console.log("Dados enviados ao front-end:", data.slice(0, 5)); // Log dos primeiros 5 registros para validação
    res.json(data);
  } catch (error) {
    console.error('Erro ao processar a planilha:', error.message);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router; // Certifique-se de exportar o roteador
