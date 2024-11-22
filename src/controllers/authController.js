// src/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
  const { username, password } = req.body;
  User.findByUsername(username, (err, user) => {
    if (err || !user) return res.status(400).send('Usuário não encontrado.');
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        res.status(400).send('Senha incorreta.');
      }
    });
  });
};