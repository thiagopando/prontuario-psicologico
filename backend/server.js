const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const os = require("os");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Função para pegar o IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback se não achar o IP
}

const ip = getLocalIP();

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../public")));

// Conexão com o banco de dados
const db = new sqlite3.Database("./database/database.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Rota para servir o index.html na raiz "/"
app.get("/", (req, res) => {
  console.log("Requisição recebida em /");
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

// ==========================
// ROTA DE LOGIN
// ==========================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Tentativa de login:", email);

  db.get(
    "SELECT * FROM psicologo WHERE email = ? AND password = ?",
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

// ==========================
// ROTAS PACIENTES
// ==========================

// Listar todos os pacientes de um psicólogo
app.get("/pacientes/psicologo/:psicologo_id", (req, res) => {
  const { psicologo_id } = req.params;

  console.log(`🔍 Buscando todos os pacientes do psicólogo ${psicologo_id}`);

  db.all(
    "SELECT * FROM pacientes WHERE psicologo_id = ?",
    [psicologo_id],
    (err, rows) => {
      if (err) {
        console.error("Erro ao buscar pacientes:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Cadastrar paciente
app.post("/pacientes", (req, res) => {
  const {
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
  } = req.body;

  console.log("Tentativa de cadastro de paciente:", nome);

  db.run(
    `INSERT INTO pacientes (
      psicologo_id, nome, nascimento, telefone, email, cpf, rg, valor_sessao, mesmo_pagador,
      pagador_nome, pagador_contato, pagador_cpf, pagador_rg,
      endereco_cep, endereco_rua, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
app.put("/pacientes/:id", (req, res) => {
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
    psicologo_id, // usado só para validar a propriedade
  } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE pacientes SET nome = ?, nascimento = ?, telefone = ?, email = ?,
     cpf = ?, rg = ?, valor_sessao = ?, mesmo_pagador = ?, pagador_nome = ?,
     pagador_contato = ?, pagador_cpf = ?, pagador_rg = ?, endereco_cep = ?,
     endereco_rua = ?, endereco_numero = ?, endereco_complemento = ?,
     endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?
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
      id,
      psicologo_id, // <- usado aqui
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
app.delete("/pacientes/:id/:psicologo_id", (req, res) => {
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

// ==========================
// ROTAS SESSÕES (PRONTUÁRIOS)
// ==========================

// Listar sessões de um paciente
app.get("/sessoes/paciente/:paciente_id", (req, res) => {
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

// Buscar uma sessão específica
app.get("/sessoes/:id", (req, res) => {
  const { id } = req.params;

  console.log(`Buscando sessão ${id}`);

  db.get("SELECT * FROM sessoes WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar sessão:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Sessão não encontrada." });
    }

    res.json(row);
  });
});

// Registrar nova sessão
app.post("/sessoes", (req, res) => {
  const { psicologo_id, paciente_id, data, descricao, pago } = req.body;

  if (!paciente_id) {
    return res.status(400).json({ error: "ID do paciente é obrigatório." });
  }

  console.log(`Registrando nova sessão para o paciente ${paciente_id}`);

  db.run(
    `INSERT INTO sessoes (psicologo_id, paciente_id, data, descricao, pago) VALUES (?, ?, ?, ?)`,
    [psicologo_id, paciente_id, data, descricao, pago],
    function (err) {
      if (err) {
        console.error("Erro ao registrar sessão:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(
        `Sessão registrada com sucesso para o paciente ${paciente_id}`
      );
      res.json({ id: this.lastID, message: "Sessão registrada com sucesso!" });
    }
  );
});

// Atualizar sessão
app.put("/sessoes/:id", (req, res) => {
  const { data, descricao, pago } = req.body;
  const { id } = req.params;
  console.log("Tentativa de atualização de sessão:", id);

  db.run(
    `UPDATE sessoes SET data = ?, descricao = ?, pago = ? WHERE id = ?`,
    [data, descricao, pago, id],
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
app.delete("/sessoes/:id", (req, res) => {
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

app.get("/pacientes/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Buscando paciente com ID: ${id} no banco de dados`);
  db.get("SELECT * FROM pacientes WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar paciente:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Paciente não encontrado." });
    }
    console.log("✅ Paciente encontrado:", row); // <--- aqui
    res.json(row);
  });
});

app.get("/psicologos/:id", (req, res) => {
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

app.post("/tecnicas", (req, res) => {
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

app.get("/tecnicas/:psicologo_id", (req, res) => {
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

// ==========================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================
// Inicialização do servidor escutando em todas as interfaces
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando em:`);
  console.log(`👉 Localhost: http://localhost:${port}`);
  console.log(`👉 Na rede:  http://${ip}:${port}`);
});
