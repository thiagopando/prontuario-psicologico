const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// Listar sessões de um paciente
router.get("/paciente/:paciente_id", (req, res) => {
  const { paciente_id } = req.params;

  console.log(`Listando sessões do paciente ${paciente_id}`);

  db.all(
    "SELECT * FROM sessoes WHERE paciente_id = ?",
    [paciente_id],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar sessões:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

// Atualizar sessão
router.put("/:id", (req, res) => {
  const { data, descricao, status } = req.body;
  const { id } = req.params;
  console.log("Tentativa de atualização de sessão:", id);

  db.run(
    `UPDATE sessoes SET data = ?, descricao = ?, status = ? WHERE id = ?`,
    [data, descricao, status, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar sessão:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("Sessão atualizada com sucesso:", id);
      res.json({ message: "Sessão atualizada com sucesso!" });
    }
  );
});

// Excluir sessão
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  console.log(`Tentativa de exclusão da sessão ${id}`);

  db.run("DELETE FROM sessoes WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao excluir sessão:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Sessão não encontrada." });
    }

    console.log(`Sessão ${id} excluída com sucesso`);
    res.json({ message: "Sessão excluída com sucesso!" });
  });
});

// Buscar uma sessão específica
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT s.*, p.psicologo_id FROM sessoes s
     JOIN pacientes p ON s.paciente_id = p.id
     WHERE s.id = ?`,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const psicologoLogado = req.headers["psicologo-id"];

      if (!row || row.psicologo_id != psicologoLogado) {
        return res.status(403).json({ error: "Acesso negado à sessão." });
      }

      res.json(row);
    }
  );
});

// Registrar nova sessão
router.post("/", (req, res) => {
  const {
    psicologo_id,
    paciente_id,
    data,
    descricao,
    tecnicas_utilizadas,
    emocao_predominante,
    comportamentos_notaveis,
    reacoes_paciente,
    status = "pendente",
  } = req.body;

  console.log("Dados recebidos para nova sessão:", {
    psicologo_id,
    paciente_id,
    data,
    descricao,
    tecnicas_utilizadas,
    emocao_predominante,
    comportamentos_notaveis,
    reacoes_paciente,
    status,
  });

  if (!paciente_id) {
    return res.status(400).json({ error: "ID do paciente é obrigatório." });
  }

  db.run(
    `INSERT INTO sessoes (psicologo_id, paciente_id, data, descricao, tecnicas_utilizadas, emocao_predominante, comportamentos_notaveis, reacoes_paciente, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      psicologo_id,
      paciente_id,
      data,
      descricao,
      tecnicas_utilizadas,
      emocao_predominante,
      comportamentos_notaveis,
      reacoes_paciente,
      status,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao registrar sessão:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: "Sessão registrada com sucesso!" });
    }
  );
});

module.exports = router;
