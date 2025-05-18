const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// GET /financeiro/sessoes/:psicologo_id/:ano/:mes?paciente_id=XYZ
router.get("/sessoes/:psicologo_id/:ano/:mes", (req, res) => {
  const { psicologo_id, ano, mes } = req.params;
  const { paciente_id } = req.query;

  const inicio = `${ano}-${mes}-01`;
  const fim = `${ano}-${mes}-31`;

  let query = `
    SELECT 
        sessoes.id,
        sessoes.data, 
        sessoes.status, 
        pacientes.nome AS nome_paciente, 
        pacientes.valor_sessao
    FROM sessoes
    JOIN pacientes ON sessoes.paciente_id = pacientes.id
    WHERE sessoes.psicologo_id = ? AND date(sessoes.data) BETWEEN ? AND ?
  `;

  const params = [psicologo_id, inicio, fim];

  if (paciente_id) {
    query += " AND pacientes.id = ?";
    params.push(paciente_id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar sessões:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Nenhuma sessão encontrada." });
    }

    res.json(rows);
  });
});

// PUT /financeiro/sessao/:id/pagar
router.put("/sessao/:id/pagar", (req, res) => {
  const { id } = req.params;

  const query = `UPDATE sessoes SET status = 'pago' WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) {
      console.error("Erro ao atualizar sessão:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Sessão não encontrada." });
    }

    res.json({ message: "Sessão atualizada com sucesso." });
  });
});

module.exports = router;
