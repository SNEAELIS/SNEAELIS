// src/models/userModel.js
const db = require('../../config/db');

const User = {
  create: (username, password, role, callback) => {
    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.run(sql, [username, password, role], callback);
  },
  findByUsername: (username, callback) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], callback);
  }
};

module.exports = User;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Função para criar um usuário
const createUser = (username, password, callback) => {
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
    callback(err, this.lastID);  // Retorna o ID do novo usuário ou erro
  });
};

// Função para encontrar um usuário pelo nome de usuário (para o login)
const findUserByUsername = (username, callback) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
    callback(err, row);  // Retorna o usuário ou erro
  });
};

module.exports = { createUser, findUserByUsername };