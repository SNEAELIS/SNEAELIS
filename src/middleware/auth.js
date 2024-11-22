// src/middleware/auth.js

function verificarNivelAcesso(nivelRequerido) {
    return (req, res, next) => {
        // Verifica se o usuário está autenticado e possui sessão
        if (!req.session || !req.session.user) {
            return res.render('acesso-negado', { message: 'Você precisa fazer login para acessar esta página.' });
        }

        const { nivel_acesso } = req.session.user;

        // Verifica se o nível de acesso é suficiente
        if (nivel_acesso >= nivelRequerido) {
            return next(); // Usuário autorizado
        }

        // Caso o nível de acesso seja insuficiente
        res.render('acesso-negado', { message: 'Você não tem permissão para acessar esta página.' });
    };
}

module.exports = { verificarNivelAcesso };

  