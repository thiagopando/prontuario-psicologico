const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// Buscar psicólogo autenticado
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM psicologo WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar psicólogo:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Psicólogo não encontrado." });
    }

    res.json(row);
  });
});

// Criar novo psicólogo (POST)
router.post("/", (req, res) => {
  const {
    nome,
    crp,
    telefone,
    email,
    password,
    validade_documentos,
    endereco_cep,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    endereco_cidade,
    endereco_estado,
  } = req.body;

  db.run(
    `INSERT INTO psicologo (
      nome, crp, telefone, email, password, validade_documentos,
      endereco_cep, endereco_rua, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome,
      crp,
      telefone,
      email,
      password,
      validade_documentos,
      endereco_cep,
      endereco_rua,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao criar psicólogo:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res
        .status(201)
        .json({ message: "Psicólogo criado com sucesso!", id: this.lastID });
    }
  );
});

// Atualizar psicólogo existente (PUT)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome,
    crp,
    telefone,
    email,
    password, // Pode ser opcional
    validade_documentos,
    endereco_cep,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    endereco_cidade,
    endereco_estado,
  } = req.body;

  // Buscar o psicólogo atual para verificar o valor do password
  db.get("SELECT password FROM psicologo WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar psicólogo:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Psicólogo não encontrado." });
    }

    // Se o password não for enviado, mantém o valor atual
    const passwordToUpdate = password || row.password;

    db.run(
      `UPDATE psicologo SET
        nome = ?, crp = ?, telefone = ?, email = ?, password = ?, validade_documentos = ?,
        endereco_cep = ?, endereco_rua = ?, endereco_numero = ?, endereco_complemento = ?,
        endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?
      WHERE id = ?`,
      [
        nome,
        crp,
        telefone,
        email,
        passwordToUpdate, // Atualiza com o valor enviado ou mantém o atual
        validade_documentos,
        endereco_cep,
        endereco_rua,
        endereco_numero,
        endereco_complemento,
        endereco_bairro,
        endereco_cidade,
        endereco_estado,
        id,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao atualizar psicólogo:", err.message);
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: "Psicólogo não encontrado." });
        }

        res.json({ message: "Psicólogo atualizado com sucesso!" });
      }
    );
  });
});

module.exports = router;
