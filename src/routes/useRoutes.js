const express = require('express');
const router = express.Router();
const { cadastrarUsuario, verificarCodigo, loginUsuario } = require('../controllers/userController');
const { verificarNivelAcesso } = require('../middleware/auth');

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

module.exports = router; // Certifique-se de exportar o roteador
