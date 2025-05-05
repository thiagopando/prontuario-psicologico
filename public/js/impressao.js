document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ids = urlParams.get("sessaoId");
  const pacienteId = urlParams.get("pacienteId");
  const ipServer = window.location.hostname;

  const container = document.getElementById("conteudoImpresso");
  const titulo = document.querySelector("h1");
  const btnImprimirTodas = document.getElementById("btnImprimirTodas"); // Botão "Imprimir todas as sessões"

  // Recuperar o psicologoId do localStorage
  const psicologoId = localStorage.getItem("psicologoId");
  if (!psicologoId) {
    container.innerHTML =
      '<p class="text-red-600">Erro: ID do psicólogo não encontrado. Faça login novamente.</p>';
    return;
  }

  if (!pacienteId) {
    container.innerHTML =
      '<p class="text-red-600">Erro: ID do paciente não informado.</p>';
    return;
  }

  // Configurar o evento do botão "Imprimir todas as sessões"
  if (btnImprimirTodas) {
    btnImprimirTodas.addEventListener("click", () => {
      const ids = urlParams.get("sessaoId");
      if (!ids) {
        alert("Nenhuma sessão foi selecionada para impressão.");
        return;
      }
      window.location.href = `impressao.html?sessaoId=${ids}&pacienteId=${pacienteId}`;
    });
  }

  // Buscar informações do paciente
  try {
    const resPaciente = await fetch(
      `http://${ipServer}:3000/pacientes/${pacienteId}/${psicologoId}`
    );
    if (!resPaciente.ok)
      throw new Error("Erro ao buscar informações do paciente.");
    const paciente = await resPaciente.json();

    // Atualizar o título com as informações do paciente
    titulo.textContent = `Sessões do Paciente: ${paciente.nome} (CPF: ${paciente.cpf}, RG: ${paciente.rg})`;
  } catch (error) {
    console.error("Erro ao buscar informações do paciente:", error);
    container.innerHTML =
      '<p class="text-red-600">Erro ao carregar informações do paciente.</p>';
    return;
  }

  if (!ids) {
    container.innerHTML =
      '<p class="text-red-600">Nenhuma sessão foi informada.</p>';
    return;
  }

  const idArray = ids
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter(Boolean);

  for (const sessaoId of idArray) {
    try {
      const res = await fetch(`http://${ipServer}:3000/sessoes/${sessaoId}`, {
        headers: {
          "psicologo-id": psicologoId,
        },
      });
      if (!res.ok) throw new Error(`Sessão ${sessaoId} não encontrada`);
      const s = await res.json();

      const div = document.createElement("div");
      div.className = "bg-white border border-gray-300 p-4 rounded-lg shadow";

      div.innerHTML = `
        <p><span class="font-semibold">Data:</span> ${s.data}</p>
        <p><span class="font-semibold">Pago:</span> ${
          s.pago ? "Sim" : "Não"
        }</p>
        <p><span class="font-semibold">Descrição:</span></p>
        <p class="mt-2 whitespace-pre-wrap">${s.descricao}</p>
        <p><span class="font-semibold">Técnicas Utilizadas:</span> ${
          s.tecnicas_utilizadas || "Não informado"
        }</p>
        <p><span class="font-semibold">Emoções Predominantes:</span> ${
          s.emocao_predominante || "Não informado"
        }</p>
        <p><span class="font-semibold">Comportamentos Notáveis:</span> ${
          s.comportamentos_notaveis || "Não informado"
        }</p>
        <p><span class="font-semibold">Reações do Paciente:</span> ${
          s.reacoes_paciente || "Não informado"
        }</p>
      `;

      container.appendChild(div);
    } catch (error) {
      console.error(`Erro ao buscar sessão ${sessaoId}:`, error);
    }
  }
});
