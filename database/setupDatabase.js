const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(path.join(__dirname, "database.db"));

// Criação das tabelas
db.serialize(() => {
  // ✅ TABELA DE PSICÓLOGO (perfil do usuário)
  db.run(`
    CREATE TABLE IF NOT EXISTS psicologo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      crp TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      password TEXT NOT NULL,
      validade_documentos INTEGER DEFAULT 90,
      endereco_cep TEXT,
      endereco_rua TEXT,
      endereco_numero TEXT,
      endereco_complemento TEXT,
      endereco_bairro TEXT,
      endereco_cidade TEXT,
      endereco_estado TEXT,
      cpf_cnpj TEXT, -- Novo campo
      inscricao_municipal TEXT, -- Novo campo
      razao_social TEXT, -- Novo campo
      regime_tributario TEXT, -- Novo campo
      iss_retido TEXT DEFAULT '2', -- Novo campo (padrão: "2")
      codigo_servico TEXT DEFAULT '801' -- Novo campo (padrão: "801")
    )
  `);

  // Inserção do usuário admin padrão
  db.run(`
    INSERT OR IGNORE INTO psicologo (id, nome, crp, email, password)
    VALUES ('1', 'administrador', '0010101', 'admin@teste.com', 'Komodor1990!')
  `);

  // ✅ TABELA DE PACIENTES COMPLETA
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologo_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      nascimento TEXT,
      telefone TEXT,
      email TEXT,
      cpf TEXT,
      rg TEXT,
      valor_sessao REAL,
      mesmo_pagador INTEGER DEFAULT 0,
      pagador_nome TEXT,
      pagador_contato TEXT,
      pagador_cpf TEXT,
      pagador_rg TEXT,
      endereco_rua TEXT,
      endereco_numero TEXT,
      endereco_complemento TEXT,
      endereco_bairro TEXT,
      endereco_cidade TEXT,
      endereco_estado TEXT,
      endereco_cep TEXT,
      queixa_principal TEXT,
      objetivo_terapeutico TEXT,
      hipoteses_iniciais TEXT,
      status_caso TEXT DEFAULT 'Em processo terapêutico',
      motivo_encerramento TEXT,
      encaminhamentos_realizados TEXT,
      profissional_destino TEXT,
      FOREIGN KEY (psicologo_id) REFERENCES psicologo(id)
    )
  `);

  // ✅ TABELA DE SESSÕES (PRONTUÁRIOS)
  db.run(`
  CREATE TABLE IF NOT EXISTS sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    psicologo_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tecnicas_utilizadas TEXT,
    emocao_predominante TEXT,
    comportamentos_notaveis TEXT,
    reacoes_paciente TEXT,
    status TEXT DEFAULT 'pendente',
    FOREIGN KEY (psicologo_id) REFERENCES psicologo(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  )
`);

  // ✅ TABELA DE TÉCNICAS PERSONALIZADAS
  db.run(`
    CREATE TABLE IF NOT EXISTS tecnicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologo_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      UNIQUE(psicologo_id, nome),
      FOREIGN KEY (psicologo_id) REFERENCES psicologo(id)
    )
  `);

  // ✅ TABELA DE PROFISSIONAIS / DESTINOS
  db.run(`
    CREATE TABLE IF NOT EXISTS profissionais_destino (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      psicologo_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      UNIQUE(psicologo_id, nome),
      FOREIGN KEY (psicologo_id) REFERENCES psicologo(id)
    )
  `);

  // ✅ TABELA DE FATURAS
  db.run(`CREATE TABLE IF NOT EXISTS faturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    psicologo_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    descricao TEXT,
    valor REAL NOT NULL,
    status TEXT DEFAULT 'pendente',
    data_emissao TEXT,
    data_pagamento TEXT,
    tipo TEXT DEFAULT 'recibo',
    FOREIGN KEY (psicologo_id) REFERENCES psicologo(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
  )

`);

  // Criação dos índices
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_faturas_psicologo_id ON faturas (psicologo_id);
    CREATE INDEX IF NOT EXISTS idx_sessoes_paciente_id ON sessoes (paciente_id);
  `);
});

// Finalização
db.close();
console.log("✅ Banco de dados e tabelas criados com sucesso!");
