const initializePool = require('../../config/db');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');

let pool;

(async () => {
  pool = await initializePool(); // Aguarda o pool estar pronto
})();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'pedrodiasdesenvolvedor123@gmail.com',
    pass: 'awss jpcy sbta cjsu',
  },
});

const gerarCodigoVerificacao = () => Math.floor(10000 + Math.random() * 90000).toString();

exports.cadastrarUsuario = async (req, res) => {
  try {
    if (!pool) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda 5s se pool não estiver pronto
      if (!pool) throw new Error('Pool não inicializado após espera.');
    }

    const { nome_completo, email, cpf, senha, nivel_acesso } = req.body;
    const codigoVerificacao = gerarCodigoVerificacao();

    const salt = await bcryptjs.genSalt(10);
    const senhaHash = await bcryptjs.hash(senha, salt);

    const result = await pool.query(
      `INSERT INTO users (nome_completo, email, cpf, senha, nivel_acesso, codigo_verificacao) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome_completo, email, cpf, senhaHash, nivel_acesso, codigoVerificacao]
    );

    const mailOptions = {
      from: 'pedrodiasdesenvolvedor123@gmail.com',
      to: email,
      subject: 'Código de Verificação - Ministério do Esporte',
      text: `Seu código de verificação é: ${codigoVerificacao}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado para:', email);

    res.render('verificar', { email });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    if (error.code === '23505') {
      const detail = error.detail || '';
      if (detail.includes('email')) {
        return res.status(400).render('cadastro', { error: 'E-mail já cadastrado.' });
      } else if (detail.includes('cpf')) {
        return res.status(400).render('cadastro', { error: 'CPF já cadastrado.' });
      }
    }
    res.status(500).render('cadastro', { error: 'Erro ao cadastrar: ' + error.message });
  }
};

exports.verificarCodigo = async (req, res) => {
  const { email, codigo } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET verificado = TRUE 
       WHERE email = $1 AND codigo_verificacao = $2 RETURNING *`,
      [email, codigo]
    );

    if (result.rowCount === 0) {
      return res.status(400).render('verificar', { email, error: 'Código inválido ou expirado.' });
    }

    res.render('verificacao-sucesso', { email });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    res.status(500).render('verificar', { email, error: 'Erro ao verificar código.' });
  }
};

exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.render('login', { error: 'Usuário ou senha incorretos.' });
    }

    const user = result.rows[0];
    const senhaValida = await bcryptjs.compare(senha, user.senha);
    if (!senhaValida) {
      return res.render('login', { error: 'Usuário ou senha incorretos.' });
    }

    req.session.user = {
      nome_completo: user.nome_completo,
      nivel_acesso: user.nivel_acesso,
      email: user.email,
    };

    res.redirect('/paginaprincipal');
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.render('login', { error: 'Erro interno. Tente novamente.' });
  }
};