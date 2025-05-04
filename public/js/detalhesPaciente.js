document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get("id");
  const ipServer = window.location.hostname;

  const dadosPaciente = document.getElementById("dadosPaciente");
  const listaSessoes = document.getElementById("listaSessoes");
  const btnExcluir = document.getElementById("excluirPaciente");
  const btnNovaSessao = document.getElementById("novaSessao");
  const btnExcluirSessao = document.getElementById("excluirSessao");

  window.imprimirSessao = imprimirSessao;
  window.excluirSessao = excluirSessao;

  // Carregar dados do paciente
  async function carregarPaciente() {
    try {
      const psicologoId = localStorage.getItem("psicologoId");

      const res = await fetch(
        `http://${ipServer}:3000/pacientes/${pacienteId}/${psicologoId}`
      );

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
        `http://${ipServer}:3000/sessoes/paciente/${pacienteId}`
      );
      sessoes = await res.json(); // Atribuir os dados à variável global

      listaSessoes.innerHTML = "";

      if (sessoes.length === 0) {
        listaSessoes.innerHTML =
          '<p class="text-gray-600">Sem sessões registradas.</p>';
        return;
      }

      sessoes.forEach((s) => {
        const li = document.createElement("li");
        li.className =
          "bg-gray-100 p-4 rounded-lg shadow-sm flex items-center justify-between";

        li.innerHTML = `
        <div>
          <p><span class="font-semibold">Data:</span> ${s.data}</p>
          <p><span class="font-semibold">Pago:</span> ${
            s.pago ? "Sim" : "Não"
          }</p>
          <p><span class="font-semibold">Descrição:</span> ${s.descricao}</p>
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

        const btnImprimirTodas = document.createElement("button");
        btnImprimirTodas.className =
          "mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition";
        btnImprimirTodas.textContent = "Imprimir todas as sessões";
        btnImprimirTodas.onclick = () => {
          const ids = sessoes.map((s) => s.id).join(",");
          window.location.href = `impressao.html?sessaoId=${ids}`;
        };
        listaSessoes.parentNode.insertBefore(btnImprimirTodas, listaSessoes);
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
          `http://${ipServer}:3000/pacientes/${pacienteId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          alert("Paciente excluído com sucesso.");
          window.location.href = "pacientes.html";
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
        await fetch(`http://${ipServer}:3000/sessoes/${sessaoId}`, {
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
    window.location.href = `impressao.html?sessaoId=${sessaoId}`;
  }

  // Botão Editar Paciente
  btnEditar = document.getElementById("editarPaciente");

  btnEditar.addEventListener("click", () => {
    // Redirecionar para a página de edição do paciente
    window.location.href = `cadastro_paciente.html?id=${pacienteId}`;
  });

  btnNovaSessao.addEventListener("click", () => {
    // Redirecionar para a página de cadastro de nova sessão
    window.location.href = `prontuarios.html?id=${pacienteId}`;
  });

  // Inicializar
  carregarPaciente();
  carregarSessoes();
});
