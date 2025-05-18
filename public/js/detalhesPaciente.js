document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get("id");
  const ipServer = window.location.hostname;
  const psicologoId = localStorage.getItem("psicologoId");

  const dadosPaciente = document.getElementById("dadosPaciente");
  const listaSessoes = document.getElementById("listaSessoes");
  const btnExcluir = document.getElementById("excluirPaciente");
  const btnNovaSessao = document.getElementById("novaSessao");
  const btnExcluirSessao = document.getElementById("excluirSessao");

  window.imprimirSessao = imprimirSessao;
  window.excluirSessao = excluirSessao;

  function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  // Carregar dados do paciente
  async function carregarPaciente() {
    try {
      const url = `https://${ipServer}:3000/pacientesRoutes/carregaDetalhes/${pacienteId}/${psicologoId}`;
      console.log("PsicologoID:", psicologoId);
      console.log("PacienteID:", pacienteId);
      console.log("🔍 Chamando rota:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const paciente = await res.json();

      if (!paciente || paciente.error) {
        alert("Paciente não encontrado ou acesso não autorizado.");
        return;
      }

      dadosPaciente.innerHTML = `
        <p><strong>Nome:</strong> ${paciente.nome}</p>
        <p><strong>Email:</strong> ${paciente.email}</p>
        <p><strong>Telefone:</strong> ${paciente.telefone}</p>
        <p><strong>Data de Nascimento:</strong> ${paciente.nascimento}</p>
        <p><strong>CPF:</strong> ${paciente.cpf}</p>
        <p><strong>RG:</strong> ${paciente.rg}</p>
        <p><strong>Nome do Pagador:</strong> ${paciente.pagador_nome}</p>
        <p><strong>CPF do Pagador:</strong> ${paciente.pagador_cpf}</p>
        <p><strong>RG do Pagador:</strong> ${paciente.pagador_rg}</p>
      `;
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
      alert("Erro ao carregar os dados do paciente.");
    }
  }

  // Declare sessoes no escopo global
  let sessoes = [];

  async function carregarSessoes() {
    try {
      const res = await fetch(
        `https://${ipServer}:3000/sessaoRoutes/paciente/${pacienteId}`
      );
      sessoes = await res.json(); // Atribuir os dados à variável global

      listaSessoes.innerHTML = "";

      if (sessoes.length === 0) {
        listaSessoes.innerHTML =
          '<p class="text-gray-600">Sem sessões registradas.</p>';
        return;
      }

      // Criar o botão "Imprimir todas as sessões" fora do loop
      const btnImprimirTodas = document.createElement("button");
      btnImprimirTodas.className =
        "mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition";
      btnImprimirTodas.textContent = "Imprimir todas as sessões";
      btnImprimirTodas.onclick = () => {
        const ids = sessoes.map((s) => s.id).join(",");
        window.location.href = `impressao.html?sessaoId=${ids}&pacienteId=${pacienteId}`;
      };

      // Inserir o botão antes da lista de sessões
      listaSessoes.parentNode.insertBefore(btnImprimirTodas, listaSessoes);

      sessoes.forEach((s) => {
        const li = document.createElement("li");
        li.className =
          "bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col gap-2";

        li.innerHTML = `
        <div>
          <p><span class="font-semibold">Data:</span> ${formatarData(
            s.data
          )}</p>
          <p><span class="font-semibold">Descrição:</span> ${s.descricao}</p>
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
        </div>
        <div class="flex gap-2">
          <button
            class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
            onclick="imprimirSessao(${s.id})"
          >
            Imprimir
          </button>
          <button
            class="excluir-sessao bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
          >
            Excluir
          </button>
        </div>
      `;

        const btnExcluir = li.querySelector(".excluir-sessao");
        btnExcluir.addEventListener("click", () => excluirSessao(s.id));

        listaSessoes.appendChild(li);
      });
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
      listaSessoes.innerHTML =
        '<p class="text-red-600">Erro ao carregar sessões.</p>';
    }
  }

  btnExcluir.addEventListener("click", async () => {
    if (confirm("Tem certeza que deseja excluir este paciente?")) {
      try {
        const res = await fetch(
          `https://${ipServer}:3000/pacientesRoutes/${pacienteId}/${psicologoId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          alert("Paciente excluído com sucesso.");
          window.location.href = "listaPacientes.html";
        } else {
          alert("Erro ao excluir paciente.");
        }
      } catch (error) {
        console.error("Erro ao excluir paciente:", error);
        alert("Erro ao excluir paciente.");
      }
    }
  });

  // Função para excluir uma sessão
  async function excluirSessao(sessaoId) {
    if (confirm("Deseja excluir esta sessão?")) {
      try {
        await fetch(`https://${ipServer}:3000/sessaoRoutes/${sessaoId}`, {
          method: "DELETE",
        });
        alert("Sessão excluída com sucesso!");
        carregarSessoes(); // Recarregar a lista de sessões após exclusão
      } catch (error) {
        console.error("Erro ao excluir sessão:", error);
        alert("Erro ao excluir sessão. Tente novamente.");
      }
    }
  }

  function imprimirSessao(sessaoId) {
    window.location.href = `impressao.html?sessaoId=${sessaoId}&pacienteId=${pacienteId}`;
  }

  // Botão Editar Paciente
  btnEditar = document.getElementById("editarPaciente");

  btnEditar.addEventListener("click", () => {
    const psicologoId = localStorage.getItem("psicologoId"); // Recuperar o ID do psicólogo
    if (!psicologoId) {
      alert("Erro: ID do psicólogo não encontrado. Faça login novamente.");
      window.location.href = "../index.html"; // Redirecionar para a página de login
      return;
    }

    // Redirecionar para a página de edição do paciente com o psicologoId
    window.location.href = `cadastro_paciente.html?id=${pacienteId}&psicologoId=${psicologoId}`;
  });

  btnNovaSessao.addEventListener("click", () => {
    // Redirecionar para a página de cadastro de nova sessão
    window.location.href = `prontuarios.html?id=${pacienteId}`;
  });

  // Inicializar
  carregarPaciente();
  carregarSessoes();
});
