const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// Listar técnicas
router.get("/tecnicas_utilizadas/:psicologo_id", (req, res) => {
  const { psicologo_id } = req.params;

  db.all(
    "SELECT * FROM tecnicas WHERE psicologo_id = ?",
    [psicologo_id],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar técnicas:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Cadastrar técnica
router.post("/tecnicas_utilizadas", (req, res) => {
  const { nome, psicologo_id } = req.body;

  if (!psicologo_id || !nome) {
    return res.status(400).json({ error: "Dados obrigatórios ausentes." });
  }

  db.run(
    "INSERT INTO tecnicas (nome, psicologo_id) VALUES (?, ?)",
    [nome, psicologo_id],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar técnica:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: "Técnica cadastrada com sucesso." });
    }
  );
});

// Excluir técnica
router.delete("/tecnicas_utilizadas/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tecnicas WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir técnica:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Técnica não encontrada." });
    }

    res.json({ message: "Técnica excluída com sucesso!" });
  });
});

module.exports = router;
