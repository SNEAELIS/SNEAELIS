const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const path = require('path');
const { cadastrarUsuario, verificarCodigo, loginUsuario } = require('../controllers/userController');
const { verificarNivelAcesso } = require('../middleware/auth');

// Rota principal
router.get('/', (req, res) => {
  res.redirect('/login'); // Redireciona para a página de login
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

router.get('/dashboard-pesquisa', (req, res) => {
  const user = req.session.user; // Verifica o usuário na sessão
  if (!user) {
    return res.redirect('/login'); // Redireciona para login se não estiver autenticado
  }
  res.render('dashboard-pesquisa', { user }); // Renderiza a página com os dados do usuário
});


router.get('/api/pesquisa-preco', (req, res) => {
  try {
    const filePath = path.resolve(__dirname, '../../data/Planilha_Custo.xlsx');
    console.log("Caminho do arquivo:", filePath); // Log para verificar o caminho

    const workbook = xlsx.readFile(filePath);
    const sheetName = 'Resultado (3)';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`A aba "${sheetName}" não foi encontrada.`);
    }

    const data = xlsx.utils.sheet_to_json(worksheet).map(row => ({
      META: row['META'] || '',
      UF_ENTIDADE: (row['UF'] || row['UF_ENTIDADE'] || '').trim().toUpperCase(),
      VALOR_UNITARIO: parseFloat(row['VALOR UNITÁRIO']) || 0
    }));

    console.log("Dados carregados com sucesso:", data); // Log dos dados processados
    res.json(data);
  } catch (error) {
    console.error('Erro ao processar a planilha:', error.message);
    res.status(500).json({ error: error.message });
  }
});

fetch('/api/pesquisa-preco')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);
    return response.json();
  })
  .then(data => console.log("Dados recebidos:", data))
  .catch(error => console.error("Erro na API:", error));

module.exports = router; // Certifique-se de exportar o roteador
