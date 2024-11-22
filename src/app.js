const express = require('express');
const path = require('path'); // Para lidar com os caminhos absolutos
const useRoutes = require('./routes/useRoutes');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'segredo_super_seguranca', // Substitua por uma chave segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

// Configuração do EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Define o caminho para a pasta de views

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public'))); // Para acessar CSS e imagens

// Middleware para manipular requisições POST
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/', useRoutes);

const bcrypt = require('bcrypt');

exports.cadastrarUsuario = async (req, res) => {
  const { nome_completo, email, cpf, senha } = req.body;
  const codigoVerificacao = gerarCodigoVerificacao();
  const senhaHash = await bcrypt.hash(senha, 10); // Gera o hash da senha

  try {
    await pool.query(
      `INSERT INTO users (nome_completo, email, cpf, senha, codigo_verificacao) 
       VALUES ($1, $2, $3, $4, $5)`,
      [nome_completo, email, cpf, senhaHash, codigoVerificacao]
    );

    res.status(200).send('Cadastro realizado com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).send('Erro ao cadastrar usuário.');
  }
};

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
