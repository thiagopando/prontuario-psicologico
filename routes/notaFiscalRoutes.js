const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { create } = require("xmlbuilder2");

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// POST /nota-fiscal/enviar
router.post("/enviar", (req, res) => {
  const { pacienteId, ano, mes } = req.body;

  const inicio = `${ano}-${mes}-01`;
  const fim = `${ano}-${mes}-31`;

  const query = `
    SELECT 
      sessoes.data,
      pacientes.nome AS nome_paciente,
      pacientes.cpf AS cpf_paciente,
      pacientes.endereco_rua,
      pacientes.endereco_numero,
      pacientes.endereco_bairro,
      pacientes.endereco_cidade,
      pacientes.endereco_estado,
      pacientes.endereco_cep,
      psicologo.nome AS nome_psicologo,
      psicologo.crp,
      psicologo.email,
      psicologo.endereco_rua AS rua_psicologo,
      psicologo.endereco_numero AS numero_psicologo,
      psicologo.endereco_cidade AS cidade_psicologo,
      psicologo.endereco_estado AS estado_psicologo,
      pacientes.valor_sessao
    FROM sessoes
    JOIN pacientes ON sessoes.paciente_id = pacientes.id
    JOIN psicologo ON sessoes.psicologo_id = psicologo.id
    WHERE sessoes.paciente_id = ? AND sessoes.status = 'pago' AND date(sessoes.data) BETWEEN ? AND ?
  `;

  db.all(query, [pacienteId, inicio, fim], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar sessões:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma sessão paga encontrada para o período." });
    }

    // Dados fixos para exemplo (CNPJ e inscrição municipal do psicólogo devem vir do banco depois)
    const valorTotal = rows
      .reduce((sum, s) => sum + parseFloat(s.valor_sessao || 0), 0)
      .toFixed(2);
    const paciente = rows[0];
    const protocolo = "1"; // exemplo

    const xml = create({ version: "1.0", encoding: "UTF-8" })
      .ele("EnviarLoteRpsEnvio", { xmlns: "http://www.abrasf.org.br/nfse.xsd" })
      .ele("LoteRps", { Id: "lote1", versao: "2.03" })
      .ele("NumeroLote")
      .txt(protocolo)
      .up()
      .ele("Cnpj")
      .txt("00000000000191")
      .up()
      .ele("InscricaoMunicipal")
      .txt("12345678")
      .up()
      .ele("QuantidadeRps")
      .txt("1")
      .up()
      .ele("ListaRps")
      .ele("Rps")
      .ele("InfDeclaracaoPrestacaoServico", { Id: "rps001" })
      .ele("Rps")
      .ele("IdentificacaoRps")
      .ele("Numero")
      .txt("1")
      .up()
      .ele("Serie")
      .txt("RPS")
      .up()
      .ele("Tipo")
      .txt("1")
      .up()
      .up()
      .ele("DataEmissao")
      .txt(new Date().toISOString())
      .up()
      .ele("Status")
      .txt("1")
      .up()
      .up()
      .ele("Servico")
      .ele("Valores")
      .ele("ValorServicos")
      .txt(valorTotal)
      .up()
      .ele("IssRetido")
      .txt("2")
      .up()
      .ele("Aliquota")
      .txt("0.02")
      .up()
      .up()
      .ele("ItemListaServico")
      .txt("801")
      .up()
      .ele("Discriminacao")
      .txt(`Serviços de psicoterapia - ${mes}/${ano}`)
      .up()
      .ele("CodigoMunicipio")
      .txt("3550308")
      .up()
      .up()
      .ele("Tomador")
      .ele("IdentificacaoTomador")
      .ele("CpfCnpj")
      .ele("Cpf")
      .txt(paciente.cpf_paciente || "00000000000")
      .up()
      .up()
      .up()
      .ele("RazaoSocial")
      .txt(paciente.nome_paciente)
      .up()
      .ele("Endereco")
      .ele("Endereco")
      .txt(paciente.endereco_rua)
      .up()
      .ele("Numero")
      .txt(paciente.endereco_numero)
      .up()
      .ele("Bairro")
      .txt(paciente.endereco_bairro)
      .up()
      .ele("CodigoMunicipio")
      .txt("3550308")
      .up()
      .ele("Uf")
      .txt(paciente.endereco_estado)
      .up()
      .ele("Cep")
      .txt(paciente.endereco_cep.replace(/\D/g, ""))
      .up()
      .up()
      .up()
      .up()
      .up()
      .up()
      .up()
      .end({ prettyPrint: true });

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  });
});

module.exports = router;
