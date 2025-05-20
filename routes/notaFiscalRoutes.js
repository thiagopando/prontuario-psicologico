const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const { create } = require("xmlbuilder2");

const dbPath = path.join(__dirname, "../database/database.db");
const db = new sqlite3.Database(dbPath);

// POST /nota-fiscal/gerar-rps
router.post("/gerar-rps", async (req, res) => {
  const { sessaoId } = req.body;

  if (!sessaoId) {
    return res.status(400).json({ error: "O ID da sessão é obrigatório." });
  }

  const query = `
    SELECT 
      sessoes.data AS data_sessao,
      pacientes.valor_sessao AS valor_sessao,
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
      psicologo.cpf_cnpj,
      psicologo.inscricao_municipal,
      psicologo.razao_social,
      psicologo.regime_tributario,
      psicologo.iss_retido,
      psicologo.codigo_servico
    FROM sessoes
    JOIN pacientes ON sessoes.paciente_id = pacientes.id
    JOIN psicologo ON sessoes.psicologo_id = psicologo.id
    WHERE sessoes.id = ? AND sessoes.status = 'pago'
  `;

  try {
    // Buscar os dados da sessão, paciente e psicólogo
    const rows = await new Promise((resolve, reject) => {
      db.all(query, [sessaoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Sessão paga não encontrada para o ID fornecido." });
    }

    const sessao = rows[0];

    // Validar se os dados fiscais do psicólogo estão completos
    if (
      !sessao.cpf_cnpj ||
      !sessao.inscricao_municipal ||
      !sessao.razao_social ||
      !sessao.codigo_servico ||
      sessao.iss_retido === null
    ) {
      return res.status(400).json({
        error:
          "Dados fiscais do psicólogo estão incompletos. Verifique o cadastro.",
      });
    }

    // Gerar o XML da NFS-e com apenas 1 RPS
    const xml = create({ version: "1.0", encoding: "UTF-8" })
      .ele("EnviarLoteRpsEnvio", { xmlns: "http://www.abrasf.org.br/nfse.xsd" })
      .ele("LoteRps", { Id: "lote1", versao: "2.03" })
      .ele("NumeroLote")
      .txt("1") // Número do lote
      .up()
      .ele("Prestador")
      .ele("CpfCnpj")
      .ele("Cnpj")
      .txt(sessao.cpf_cnpj) // CNPJ do psicólogo
      .up()
      .up()
      .ele("InscricaoMunicipal")
      .txt(sessao.inscricao_municipal) // Inscrição municipal
      .up()
      .up()
      .ele("QuantidadeRps")
      .txt("1") // Apenas 1 RPS no lote
      .up()
      .ele("ListaRps")
      .ele("Rps")
      .ele("InfDeclaracaoPrestacaoServico", { Id: `rps_${sessaoId}` })
      .ele("Rps")
      .ele("IdentificacaoRps")
      .ele("Numero")
      .txt(sessaoId) // Número do RPS
      .up()
      .ele("Serie")
      .txt("RPS") // Série do RPS
      .up()
      .ele("Tipo")
      .txt("1") // Tipo do RPS
      .up()
      .up()
      .ele("DataEmissao")
      .txt(sessao.data_sessao) // Data da sessão no formato AAAA-MM-DD
      .up()
      .ele("Status")
      .txt("1") // Status do RPS
      .up()
      .ele("Servico")
      .ele("Valores")
      .ele("ValorServicos")
      .txt(parseFloat(sessao.valor_sessao).toFixed(2)) // Valor da sessão
      .up()
      .ele("Aliquota")
      .txt("0.02") // Alíquota fixa (ajuste conforme necessário)
      .up()
      .up()
      .ele("IssRetido")
      .txt(sessao.iss_retido) // ISS Retido
      .up()
      .ele("ItemListaServico")
      .txt(sessao.codigo_servico) // Código do serviço
      .up()
      .ele("Discriminacao")
      .txt(`Serviço de psicoterapia realizado em ${sessao.data_sessao}`)
      .up()
      .ele("CodigoMunicipio")
      .txt("3550308") // Código do município (ajuste conforme necessário)
      .up()
      .up()
      .ele("Tomador")
      .ele("IdentificacaoTomador")
      .ele("CpfCnpj")
      .ele("Cpf")
      .txt(sessao.cpf_paciente)
      .up()
      .up()
      .up()
      .ele("RazaoSocial")
      .txt(sessao.nome_paciente)
      .up()
      .ele("Endereco")
      .ele("Endereco")
      .txt(sessao.endereco_rua)
      .up()
      .ele("Numero")
      .txt(sessao.endereco_numero)
      .up()
      .ele("Bairro")
      .txt(sessao.endereco_bairro)
      .up()
      .ele("CodigoMunicipio")
      .txt("3550308") // Código do município do tomador
      .up()
      .ele("Uf")
      .txt(sessao.endereco_estado)
      .up()
      .ele("Cep")
      .txt(sessao.endereco_cep.replace(/\D/g, ""))
      .up()
      .up()
      .up()
      .up()
      .up()
      .end({ prettyPrint: true });

    // Criar diretório /xmls se não existir
    const xmlDir = path.join(__dirname, "../xmls");
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir);
    }

    // Nome do arquivo baseado no ID da sessão
    const nomeArquivo = `rps_individual_sessao_${sessaoId}.xml`;
    const caminhoCompleto = path.join(xmlDir, nomeArquivo);

    // Salvar o XML
    await fs.promises.writeFile(caminhoCompleto, xml);
    console.log("✅ XML salvo em:", caminhoCompleto);

    // Retornar o XML gerado na resposta
    res.status(200).send(xml);
  } catch (err) {
    console.error("Erro ao gerar o RPS:", err.message);
    res.status(500).json({ error: "Erro ao processar a solicitação." });
  }
});

// POST /nota-fiscal/gerar-lote
router.post("/gerar-lote", async (req, res) => {
  const { pacienteId, ano, mes } = req.body;

  if (!pacienteId || !ano || !mes) {
    return res
      .status(400)
      .json({ error: "Paciente, ano e mês são obrigatórios." });
  }

  const inicio = `${ano}-${mes}-01`;
  const fim = `${ano}-${mes}-31`;

  const query = `
    SELECT 
      sessoes.id AS sessao_id,
      sessoes.data AS data_sessao,
      pacientes.valor_sessao AS valor_sessao,
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
      psicologo.cpf_cnpj,
      psicologo.inscricao_municipal,
      psicologo.razao_social,
      psicologo.regime_tributario,
      psicologo.iss_retido,
      psicologo.codigo_servico
    FROM sessoes
    JOIN pacientes ON sessoes.paciente_id = pacientes.id
    JOIN psicologo ON sessoes.psicologo_id = psicologo.id
    WHERE sessoes.paciente_id = ? AND sessoes.status = 'pago' AND date(sessoes.data) BETWEEN ? AND ?
  `;

  try {
    // Buscar as sessões pagas do paciente no período
    const rows = await new Promise((resolve, reject) => {
      db.all(query, [pacienteId, inicio, fim], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma sessão paga encontrada para o período." });
    }

    const psicologo = rows[0]; // Usar o primeiro registro como referência para os dados do psicólogo

    // Validar se os dados fiscais do psicólogo estão completos
    if (
      !psicologo.cpf_cnpj ||
      !psicologo.inscricao_municipal ||
      !psicologo.razao_social ||
      !psicologo.codigo_servico ||
      psicologo.iss_retido === null
    ) {
      return res.status(400).json({
        error:
          "Dados fiscais do psicólogo estão incompletos. Verifique o cadastro.",
      });
    }

    // Gerar o XML do lote de RPS
    const xml = create({ version: "1.0", encoding: "UTF-8" })
      .ele("EnviarLoteRpsEnvio", { xmlns: "http://www.abrasf.org.br/nfse.xsd" })
      .ele("LoteRps", { Id: "lote1", versao: "2.03" })
      .ele("NumeroLote")
      .txt("1") // Número do lote
      .up()
      .ele("Prestador")
      .ele("CpfCnpj")
      .ele("Cnpj")
      .txt(psicologo.cpf_cnpj) // CNPJ do psicólogo
      .up()
      .up()
      .ele("InscricaoMunicipal")
      .txt(psicologo.inscricao_municipal) // Inscrição municipal
      .up()
      .up()
      .ele("QuantidadeRps")
      .txt(rows.length.toString()) // Quantidade de RPS no lote
      .up()
      .ele("ListaRps");

    // Adicionar cada sessão como um RPS
    rows.forEach((sessao, index) => {
      xml
        .ele("Rps")
        .ele("InfDeclaracaoPrestacaoServico", { Id: `rps_${sessao.sessao_id}` })
        .ele("Rps")
        .ele("IdentificacaoRps")
        .ele("Numero")
        .txt(index + 1) // Numeração sequencial
        .up()
        .ele("Serie")
        .txt("RPS") // Série do RPS
        .up()
        .ele("Tipo")
        .txt("1") // Tipo do RPS
        .up()
        .up()
        .ele("DataEmissao")
        .txt(sessao.data_sessao) // Data da sessão no formato AAAA-MM-DD
        .up()
        .ele("Status")
        .txt("1") // Status do RPS
        .up()
        .ele("Servico")
        .ele("Valores")
        .ele("ValorServicos")
        .txt(parseFloat(sessao.valor_sessao).toFixed(2)) // Valor da sessão
        .up()
        .ele("Aliquota")
        .txt("0.02") // Alíquota fixa (ajuste conforme necessário)
        .up()
        .up()
        .ele("IssRetido")
        .txt(psicologo.iss_retido) // ISS Retido
        .up()
        .ele("ItemListaServico")
        .txt(psicologo.codigo_servico) // Código do serviço
        .up()
        .ele("Discriminacao")
        .txt(`Serviço de psicoterapia realizado em ${sessao.data_sessao}`)
        .up()
        .ele("CodigoMunicipio")
        .txt("3550308") // Código do município (ajuste conforme necessário)
        .up()
        .up()
        .ele("Tomador")
        .ele("IdentificacaoTomador")
        .ele("CpfCnpj")
        .ele("Cpf")
        .txt(sessao.cpf_paciente)
        .up()
        .up()
        .up()
        .ele("RazaoSocial")
        .txt(sessao.nome_paciente)
        .up()
        .ele("Endereco")
        .ele("Endereco")
        .txt(sessao.endereco_rua)
        .up()
        .ele("Numero")
        .txt(sessao.endereco_numero)
        .up()
        .ele("Bairro")
        .txt(sessao.endereco_bairro)
        .up()
        .ele("CodigoMunicipio")
        .txt("3550308") // Código do município do tomador
        .up()
        .ele("Uf")
        .txt(sessao.endereco_estado)
        .up()
        .ele("Cep")
        .txt(sessao.endereco_cep.replace(/\D/g, ""))
        .up()
        .up()
        .up()
        .up()
        .up();
    });

    const xmlFinal = xml.end({ prettyPrint: true });

    // Criar diretório /xmls se não existir
    const xmlDir = path.join(__dirname, "../xmls");
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir);
    }

    // Nome do arquivo baseado no paciente e mês
    const nomeArquivo = `lote_${ano}_${mes}_paciente${pacienteId}.xml`;
    const caminhoCompleto = path.join(xmlDir, nomeArquivo);

    // Salvar o XML
    await fs.promises.writeFile(caminhoCompleto, xmlFinal);
    console.log("✅ XML salvo em:", caminhoCompleto);

    // Retornar o XML gerado na resposta
    res.status(200).send(xmlFinal);
  } catch (err) {
    console.error("Erro ao gerar o lote de RPS:", err.message);
    res.status(500).json({ error: "Erro ao processar a solicitação." });
  }
});

const createSoapEnvelope = (xmlLoteRps) => {
  // Cabeçalho do SOAP
  const cabecalho = `
    <cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.03">
      <versaoDados>2.03</versaoDados>
    </cabecalho>
  `;

  // Escapar caracteres especiais no XML
  const escapeXml = (unsafe) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // Escapar o cabeçalho e o XML do lote
  const escapedCabecalho = escapeXml(cabecalho);
  const escapedXmlLoteRps = escapeXml(xmlLoteRps);

  // Envelope SOAP
  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://www.prefeitura.sp.gov.br/nfse">
      <soapenv:Header/>
      <soapenv:Body>
        <nfse:TesteEnvioLoteRPS>
          <nfseCabecMsg>${escapedCabecalho}</nfseCabecMsg>
          <nfseDadosMsg>${escapedXmlLoteRps}</nfseDadosMsg>
        </nfse:TesteEnvioLoteRPS>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  return soapEnvelope;
};

module.exports = router;
