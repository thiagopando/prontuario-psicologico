import { preencherDataAtual } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  if (dataInput && !dataInput.value) {
    preencherDataAtual(dataInput);
  }
});

const selectPaciente = document.getElementById("selectPaciente");
const formSessao = document.getElementById("formSessao");
const ipServer = window.location.hostname;

// Função para listar pacientes no select
async function listarPacientes() {
  try {
    const res = await fetch(`http://${ipServer}:3000/pacientes`);
    const pacientes = await res.json();

    selectPaciente.innerHTML =
      '<option value="">Selecione um paciente</option>';

    pacientes.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.nome;
      selectPaciente.appendChild(option);
    });

    // NOVO: Preencher automaticamente se houver um ID na URL
    const urlParams = new URLSearchParams(window.location.search);
    const pacientePreSelecionado = urlParams.get("id");

    if (pacientePreSelecionado) {
      selectPaciente.value = pacientePreSelecionado;
      console.log("Paciente pré-selecionado:", pacientePreSelecionado);
    }
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
  }
}

const urlParams = new URLSearchParams(window.location.search);
const sessaoId = urlParams.get("sessaoId"); // Obter o ID da sessão da URL

// Função para carregar os dados da sessão no formulário
async function carregarSessao() {
  if (!sessaoId) {
    console.error("sessaoId não encontrado na URL.");
    return;
  }

  try {
    console.log(`Carregando sessão com ID: ${sessaoId}`);
    const res = await fetch(`http://${ipServer}:3000/sessoes/${sessaoId}`);
    console.log(`Resposta da API:`, res);

    if (!res.ok) throw new Error("Erro ao buscar sessão.");
    const sessao = await res.json();

    // Verificar se a sessão foi encontrada
    if (!sessao || Object.keys(sessao).length === 0) {
      throw new Error("Sessão não encontrada.");
    }

    console.log(`Dados da sessão:`, sessao);

    // Converter a data para o formato yyyy-MM-dd
    const dataFormatada = new Date(sessao.data).toISOString().split("T")[0];

    // Preencher o formulário com os dados da sessão
    document.getElementById("sessao_id").value = sessao.id;
    selectPaciente.value = sessao.paciente_id;
    document.getElementById("data").value = dataFormatada; // Data formatada
    document.getElementById("descricao").value = sessao.descricao;
    document.getElementById("pago").checked = sessao.pago === 1;
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);
    alert("Erro ao carregar os dados da sessão. Verifique se o ID é válido.");
  }
}

// Chamar a função ao carregar a página
carregarSessao();

// Função para salvar nova sessão
formSessao.addEventListener("submit", async function (e) {
  e.preventDefault();

  const feedback = document.getElementById("feedback");
  const sessaoId = document.getElementById("sessao_id").value;
  const pacienteId = selectPaciente.value;
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const pago = document.getElementById("pago").checked ? 1 : 0;

  if (!pacienteId) {
    alert("Selecione um paciente!");
    return;
  }

  const sessao = { paciente_id: pacienteId, data, descricao, pago };
  const url = sessaoId
    ? `http://${ipServer}:3000/sessoes/${sessaoId}`
    : `http://${ipServer}:3000/sessoes`;
  const method = sessaoId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessao),
    });

    if (response.ok) {
      feedback.textContent = "Sessão salva com sucesso!";
      feedback.className =
        "p-3 mb-6 rounded-lg text-center bg-green-100 text-green-700";
      formSessao.reset();
      document.getElementById("sessao_id").value = "";
    } else {
      throw new Error("Erro ao salvar sessão.");
    }
  } catch (error) {
    feedback.textContent = "Erro ao salvar sessão. Tente novamente.";
    feedback.className =
      "p-3 mb-6 rounded-lg text-center bg-red-100 text-red-700";
    console.error("Erro ao salvar sessão:", error);
  }

  // Exibir a mensagem por 5 segundos e depois ocultá-la
  setTimeout(() => {
    feedback.className = "hidden";
  }, 5000);
});

// Evento de mudança no selectPaciente (agora simplificado)
selectPaciente.addEventListener("change", function () {
  // Apenas uma ação mínima ou nenhuma ação
  console.log(`Paciente selecionado: ${this.value}`);
});

// Listar pacientes ao carregar a página
listarPacientes();
