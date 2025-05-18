const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const os = require("os");
const fs = require("fs");
const https = require("https");

//ARQUIVOS DE ROTAS

const app = express();
const port = 3000;

// Configurar CORS e JSON
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
const loginRoutes = require("../routes/loginRoutes");
app.use("/login", loginRoutes);

// ==========================
// ROTAS PACIENTES
// ==========================
const pacienteRoutes = require("../routes/pacientesRoutes");
app.use("/pacientesRoutes", pacienteRoutes);

// ==========================
// ROTAS SESSÕES (PRONTUÁRIOS)
// ==========================
const sessaoRoutes = require("../routes/sessaoRoutes");
app.use("/sessaoRoutes", sessaoRoutes);

// ==========================
// ROTAS PSICÓLOGOS
// ==========================
const psicologoRoutes = require("../routes/psicologoRoutes");
app.use("/psicologoRoutes", psicologoRoutes);

// ==========================
// ROTAS TÉCNICAS
// ==========================
const tecnicasRoutes = require("../routes/tecnicasRoutes");
app.use("/", tecnicasRoutes);

// ==========================
// ROTAS FINANCEIRO
// ==========================
const financeiroRoutes = require("../routes/financeiroRoutes");
app.use("/financeiro", financeiroRoutes);

// ==========================
// ROTAS NOTA FISCAL
// ==========================
const notaFiscalRoutes = require("../routes/notaFiscalRoutes");
app.use("/nota-fiscal", notaFiscalRoutes);

// ==========================
// CONFIGURAÇÃO DO HTTPS
// ==========================
const options = {
  key: fs.readFileSync(path.join(__dirname, "server.key")), // Caminho para a chave privada
  cert: fs.readFileSync(path.join(__dirname, "server.cert")), // Caminho para o certificado
};

// ==========================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================
https.createServer(options, app).listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando em HTTPS:`);
  console.log(`👉 Localhost: https://localhost:${port}`);
});
