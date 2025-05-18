const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Conexão com o banco de dados
const db = new sqlite3.Database(
  path.join(__dirname, "../database/database.db"),
  (err) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
      console.log("Conectado ao banco de dados SQLite.");
    }
  }
);

// Rota de login
router.post("/", (req, res) => {
  const { email, password } = req.body;
  console.log("Tentativa de login:", email);

  db.get(
    "SELECT id, nome FROM psicologo WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err.message);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (row) {
        console.log("Login bem-sucedido para:", email);
        return res.json({
          success: true,
          message: "Login realizado com sucesso!",
          id: row.id,
          nome: row.nome, // opcional, para exibir em tela
        });
      } else {
        console.log("Falha no login para:", email);
        return res
          .status(401)
          .json({ success: false, message: "Email ou senha inválidos." });
      }
    }
  );
});

module.exports = router;
