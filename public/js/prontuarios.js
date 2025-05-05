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
const psicologoId = localStorage.getItem("psicologoId");
console.log("ID do psicólogo recuperado:", psicologoId);

if (!psicologoId) {
  alert("Erro: ID do psicólogo não encontrado. Faça login novamente.");
  window.location.href = "../index.html"; // Redirecionar para a página de login
}

const urlParams = new URLSearchParams(window.location.search);
const sessaoId = urlParams.get("sessaoId");

// Função para listar pacientes do psicólogo logado
async function listarPacientes() {
  try {
    const res = await fetch(
      `http://${ipServer}:3000/pacientes/psicologo/${psicologoId}`
    );
    const pacientes = await res.json();

    selectPaciente.innerHTML =
      '<option value="">Selecione um paciente</option>';

    pacientes.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.nome;
      selectPaciente.appendChild(option);
    });

    const pacientePreSelecionado = urlParams.get("id");
    if (pacientePreSelecionado) {
      selectPaciente.value = pacientePreSelecionado;
      console.log("Paciente pré-selecionado:", pacientePreSelecionado);
    }
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
  }
}

// Função para carregar dados da sessão
async function carregarSessao() {
  if (!sessaoId) {
    console.warn("Nenhum sessaoId fornecido na URL.");
    return;
  }

  try {
    const res = await fetch(`http://${ipServer}:3000/sessoes/${sessaoId}`, {
      headers: {
        "psicologo-id": psicologoId,
      },
    });

    if (!res.ok) throw new Error("Erro ao buscar sessão.");
    const sessao = await res.json();

    if (!sessao || Object.keys(sessao).length === 0) {
      throw new Error("Sessão não encontrada.");
    }

    const dataFormatada = new Date(sessao.data).toISOString().split("T")[0];

    document.getElementById("sessao_id").value = sessao.id;
    selectPaciente.value = sessao.paciente_id;
    document.getElementById("data").value = dataFormatada;
    document.getElementById("descricao").value = sessao.descricao;
    document.getElementById("tecnicas_utilizadas").value =
      sessao.tecnicas || "";
    document.getElementById("emocao_predominante").value = sessao.emocao || "";
    document.getElementById("comportamentos_notaveis").value =
      sessao.comportamentos || "";
    document.getElementById("reacoes_paciente").value = sessao.reacoes || "";
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);
    alert("Erro ao carregar os dados da sessão. Verifique se o ID é válido.");
  }
}

// Enviar sessão (nova ou edição)
formSessao.addEventListener("submit", async function (e) {
  e.preventDefault();

  const feedback = document.getElementById("feedback");
  const sessaoId = document.getElementById("sessao_id").value;
  const pacienteId = selectPaciente.value;
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const tecnicas = document.getElementById("tecnicas_utilizadas").value;
  const emocao = document.getElementById("emocao_predominante").value;
  const comportamentos = document.getElementById(
    "comportamentos_notaveis"
  ).value;
  const reacoes = document.getElementById("reacoes_paciente").value;

  if (!pacienteId) {
    alert("Selecione um paciente!");
    return;
  }

  const sessao = {
    psicologo_id: psicologoId,
    paciente_id: pacienteId,
    data,
    descricao,
    tecnicas_utilizadas: tecnicas, // Corrigido
    emocao_predominante: emocao, // Corrigido
    comportamentos_notaveis: comportamentos, // Corrigido
    reacoes_paciente: reacoes, // Corrigido
  };
  console.log("Dados da sessão a serem enviados:", sessao);

  const url = sessaoId
    ? `http://${ipServer}:3000/sessoes/${sessaoId}`
    : `http://${ipServer}:3000/sessoes`;
  const method = sessaoId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "psicologo-id": psicologoId,
      },
      body: JSON.stringify(sessao),
    });

    if (response.ok) {
      feedback.textContent = "Sessão salva com sucesso!";
      feedback.className =
        "p-3 mb-6 rounded-lg text-center bg-green-100 text-green-700";
      formSessao.reset();
      document.getElementById("sessao_id").value = "";
    } else {
      const errorData = await response.json();
      console.error("Erro ao salvar sessão:", errorData);
      throw new Error("Erro ao salvar sessão.");
    }
  } catch (error) {
    feedback.textContent = "Erro ao salvar sessão. Tente novamente.";
    feedback.className =
      "p-3 mb-6 rounded-lg text-center bg-red-100 text-red-700";
    console.error("Erro ao salvar sessão:", error);
  }
});

selectPaciente.addEventListener("change", function () {
  console.log(`Paciente selecionado: ${this.value}`);
});

// Inicialização
listarPacientes();
carregarSessao();
