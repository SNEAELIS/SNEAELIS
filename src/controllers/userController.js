const getPool = require('../../config/db'); // Importa a função para obter o pool
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');

let pool = getPool(); // Obtém o pool configurado dinamicamente

// Configuração do nodemailer com Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Porta recomendada com STARTTLS
  secure: false, // false para STARTTLS, true para SSL/TLS na porta 465
  auth: {
    user: 'pedrodiasdesenvolvedor123@gmail.com', // Seu e-mail
    pass: 'awss jpcy sbta cjsu', // Senha de aplicativo gerada no Google
  },
});

// Função para gerar um código de verificação aleatório
const gerarCodigoVerificacao = () => Math.floor(10000 + Math.random() * 90000).toString();

// Controlador para cadastrar usuário
exports.cadastrarUsuario = async (req, res) => {
  pool = getPool(); // Atualiza o pool antes da operação
  const { nome_completo, email, cpf, senha, nivel_acesso } = req.body;
  const codigoVerificacao = gerarCodigoVerificacao();

  try {
    await pool.query(
      `INSERT INTO users (nome_completo, email, cpf, senha, nivel_acesso, codigo_verificacao) 
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6)`,
      [nome_completo, email, cpf, senha, nivel_acesso, codigoVerificacao]
    );

    // Configura as opções do e-mail
    const mailOptions = {
      from: 'pedrodiasdesenvolvedor123@gmail.com',
      to: email,
      subject: 'Verificação de Cadastro - Ministério do Esporte',
      text: `Olá, ${nome_completo}!\n\nSeu código de verificação é: ${codigoVerificacao}\n\nInsira este código no site para ativar sua conta.`,
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);

    // Renderiza a página de verificação
    res.render('verificar', { email });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if (error.code === '23505') {
      return res.status(400).render('cadastro', { error: 'E-mail ou CPF já cadastrado.' });
    }
    res.status(500).render('cadastro', { error: 'Erro ao cadastrar usuário.' });
  }
};

// Controlador para verificar código de verificação
exports.verificarCodigo = async (req, res) => {
  pool = getPool(); // Atualiza o pool antes da operação
  const { email, codigo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET verificado = TRUE 
       WHERE email = $1 AND codigo_verificacao = $2 RETURNING *`,
      [email, codigo]
    );

    if (result.rowCount === 0) {
      return res.status(400).render('verificar', { email, error: 'Código de verificação inválido ou expirado.' });
    }

    res.render('verificacao-sucesso', { email });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    res.status(500).render('verificar', { email, error: 'Erro ao verificar código.' });
  }
};

// Controlador para autenticar o usuário
exports.loginUsuario = async (req, res) => {
  pool = getPool(); // Atualiza o pool antes da operação
  const { email, senha } = req.body;

  try {
    console.log(`Tentativa de login com email: ${email}`);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      console.log('Usuário não encontrado no banco de dados.');
      return res.render('login', { error: 'Usuário ou senha incorretos.' });
    }

    const user = result.rows[0];
    console.log('Usuário encontrado:', user);

    const senhaValida = await bcryptjs.compare(senha, user.senha);
    if (!senhaValida) {
      console.log('Senha inválida para o usuário:', email);
      return res.render('login', { error: 'Usuário ou senha incorretos.' });
    }

    req.session.user = {
      nome_completo: user.nome_completo,
      nivel_acesso: user.nivel_acesso,
      email: user.email,
    };

    console.log(`Login bem-sucedido para o usuário: ${email}`);
    res.redirect('/paginaprincipal');
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.render('login', { error: 'Erro interno. Por favor, tente novamente.' });
  }
};
