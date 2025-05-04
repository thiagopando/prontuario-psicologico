const fs = require('fs');
const path = require('path');

// Estrutura de pastas
const folders = [
    'public',
    'public/css',
    'public/js',
    'public/img',
    'public/pages',
    'public/assets',
    'backend',
    'backend/routes',
    'backend/controllers',
    'backend/models',
    'database'
];

// Arquivos iniciais com conteúdo básico
const files = {
    'public/pages/index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prontuário Psicológico</title>
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Login</h1>
        <form id="loginForm">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>

            <label for="senha">Senha</label>
            <input type="password" id="senha" name="senha" required>

            <button type="submit">Entrar</button>
        </form>
    </div>
    <script src="../js/app.js" defer></script>
</body>
</html>`,
    'public/css/styles.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
}

.container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h1 {
    margin-bottom: 20px;
}

label {
    display: block;
    margin: 10px 0 5px;
    text-align: left;
}

input, button {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: 1px solid #ccc;
}

button {
    background-color: #007bff;
    color: white;
    border: none;
}

button:hover {
    background-color: #0056b3;
    cursor: pointer;
}`,
    'public/js/app.js': `document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    console.log('Email:', email);
    console.log('Senha:', senha);

    if (email === "admin@teste.com" && senha === "1234") {
        alert('Login realizado com sucesso!');
        // window.location.href = "../pages/dashboard.html";
    } else {
        alert('Email ou senha inválidos!');
    }
});`,
    'backend/server.js': `// Backend futuro
console.log('Servidor backend ainda não implementado.');`,
    'README.md': `# Sistema de Prontuário Psicológico

Sistema completo para gestão de prontuários psicológicos, sessões, pacientes e relatórios.

## Estrutura inicial
- Frontend com HTML, CSS, JS
- Backend planejado com Node.js (futuro)
- Pronto para expansão e integração com banco de dados.

> Desenvolvido por Thiago.`,
    'package.json': `{
  "name": "prontuario-psicologico",
  "version": "1.0.0",
  "description": "Sistema de prontuário psicológico online",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js"
  },
  "author": "Thiago",
  "license": "MIT"
}`
};

// Função para criar pastas
folders.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Pasta criada: ${dir}`);
    } else {
        console.log(`Pasta já existe: ${dir}`);
    }
});

// Função para criar arquivos
Object.entries(files).forEach(([filePath, content]) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content.trim());
        console.log(`Arquivo criado: ${filePath}`);
    } else {
        console.log(`Arquivo já existe: ${filePath}`);
    }
});

console.log('✅ Estrutura criada com sucesso!');
