const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// ✅ ROTA: Listar todos os pacientes de um psicólogo
router.get("/psicologo/:psicologo_id", (req, res) => {
  const { psicologo_id } = req.params;

  db.all(
    "SELECT * FROM pacientes WHERE psicologo_id = ?",
    [psicologo_id],
    (err, rows) => {
      if (err) {
        console.error("Erro ao listar pacientes:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Cadastrar paciente
router.post("/cadastraPaciente/:psicologo_id", (req, res) => {
  const {
    nome,
    nascimento,
    telefone,
    email,
    cpf,
    rg,
    valor_sessao,
    mesmo_pagador,
    pagador_nome,
    pagador_contato,
    pagador_cpf,
    pagador_rg,
    endereco_cep,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    endereco_cidade,
    endereco_estado,
    queixa_principal,
    objetivo_terapeutico,
    hipoteses_iniciais,
    status_caso,
    motivo_encerramento,
    encaminhamentos_realizados,
    profissional_destino,
  } = req.body;
  const { psicologo_id } = req.params;

  console.log("Tentativa de cadastro de paciente:", nome);

  db.run(
    `INSERT INTO pacientes (
      psicologo_id, nome, nascimento, telefone, email, cpf, rg, valor_sessao, mesmo_pagador,
      pagador_nome, pagador_contato, pagador_cpf, pagador_rg,
      endereco_cep, endereco_rua, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_estado,
      queixa_principal, objetivo_terapeutico, hipoteses_iniciais, status_caso,
      motivo_encerramento, encaminhamentos_realizados, profissional_destino
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      psicologo_id,
      nome,
      nascimento,
      telefone,
      email,
      cpf,
      rg,
      valor_sessao,
      mesmo_pagador,
      pagador_nome,
      pagador_contato,
      pagador_cpf,
      pagador_rg,
      endereco_cep,
      endereco_rua,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      queixa_principal,
      objetivo_terapeutico,
      hipoteses_iniciais,
      status_caso,
      motivo_encerramento,
      encaminhamentos_realizados,
      profissional_destino,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao cadastrar paciente:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("Paciente cadastrado com sucesso:", nome);
      res.json({
        id: this.lastID,
        message: "Paciente cadastrado com sucesso!",
      });
    }
  );
});

// Atualizar paciente, somente se pertencer ao psicólogo autenticado
router.put("/atualizaPaciente/:id/:psicologo_id", (req, res) => {
  const {
    nome,
    nascimento,
    telefone,
    email,
    cpf,
    rg,
    valor_sessao,
    mesmo_pagador,
    pagador_nome,
    pagador_contato,
    pagador_cpf,
    pagador_rg,
    endereco_cep,
    endereco_rua,
    endereco_numero,
    endereco_complemento,
    endereco_bairro,
    endereco_cidade,
    endereco_estado,
    queixa_principal,
    objetivo_terapeutico,
    hipoteses_iniciais,
    status_caso,
    motivo_encerramento,
    encaminhamentos_realizados,
    profissional_destino,
  } = req.body;
  const { id, psicologo_id } = req.params;

  console.log("Tentativa de atualização de paciente:", id);

  db.run(
    `UPDATE pacientes SET 
      nome = ?, nascimento = ?, telefone = ?, email = ?, cpf = ?, rg = ?, valor_sessao = ?, 
      mesmo_pagador = ?, pagador_nome = ?, pagador_contato = ?, pagador_cpf = ?, pagador_rg = ?, 
      endereco_cep = ?, endereco_rua = ?, endereco_numero = ?, endereco_complemento = ?, 
      endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?, 
      queixa_principal = ?, objetivo_terapeutico = ?, hipoteses_iniciais = ?, status_caso = ?, 
      motivo_encerramento = ?, encaminhamentos_realizados = ?, profissional_destino = ?
      WHERE id = ? AND psicologo_id = ?`,
    [
      nome,
      nascimento,
      telefone,
      email,
      cpf,
      rg,
      valor_sessao,
      mesmo_pagador,
      pagador_nome,
      pagador_contato,
      pagador_cpf,
      pagador_rg,
      endereco_cep,
      endereco_rua,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      queixa_principal,
      objetivo_terapeutico,
      hipoteses_iniciais,
      status_caso,
      motivo_encerramento,
      encaminhamentos_realizados,
      profissional_destino,
      id,
      psicologo_id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar paciente:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          error: "Paciente não encontrado ou não pertence a este psicólogo.",
        });
      }
      res.json({ message: "Paciente atualizado com sucesso!" });
    }
  );
});

// Excluir paciente
router.delete("/:id/:psicologo_id", (req, res) => {
  const { id, psicologo_id } = req.params;

  db.run(
    `DELETE FROM pacientes WHERE id = ? AND psicologo_id = ?`,
    [id, psicologo_id],
    function (err) {
      if (err) {
        console.error("Erro ao excluir paciente:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          error: "Paciente não encontrado ou não pertence a este psicólogo.",
        });
      }
      res.json({ message: "Paciente removido com sucesso!" });
    }
  );
});

// Carrega os detalhes do paciente na tela de detalhes
router.get("/carregaDetalhes/:id/:psicologo_id", (req, res) => {
  const { id, psicologo_id } = req.params;

  db.get(
    "SELECT * FROM pacientes WHERE id = ? AND psicologo_id = ?",
    [id, psicologo_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res
          .status(404)
          .json({ error: "Paciente não encontrado ou acesso não autorizado." });
      }

      res.json(row);
    }
  );
});

module.exports = router;
