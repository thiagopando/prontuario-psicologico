document.addEventListener("DOMContentLoaded", () => {
  const formTecnica = document.getElementById("formTecnica");
  const listaTecnicas = document
    .getElementById("listaTecnicas")
    .querySelector("ul");
  const ipServer = window.location.hostname;
  const psicologoId = localStorage.getItem("psicologoId");

  if (!psicologoId) {
    alert("Erro: ID do psicólogo não encontrado. Faça login novamente.");
    window.location.href = "../index.html";
    return;
  }

  // Função para listar técnicas
  async function listarTecnicas() {
    try {
      const res = await fetch(
        `https://${ipServer}:3000/tecnicas_utilizadas/${psicologoId}`
      );
      if (!res.ok) throw new Error("Erro ao buscar técnicas.");
      const tecnicas = await res.json();

      listaTecnicas.innerHTML = ""; // Limpar lista antes de renderizar

      if (!tecnicas || tecnicas.length === 0) {
        // Exibir mensagem amigável se não houver técnicas cadastradas
        listaTecnicas.innerHTML =
          '<p class="text-gray-600">Nenhuma técnica cadastrada. Cadastre uma nova técnica acima.</p>';
        return;
      }

      tecnicas.forEach((tecnica) => {
        const li = document.createElement("li");
        li.className =
          "bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between items-center";
        li.innerHTML = `
          <span>${tecnica.nome}</span>
          <button
            class="text-red-600 hover:underline"
            onclick="excluirTecnica(${tecnica.id})"
          >
            Excluir
          </button>
        `;
        listaTecnicas.appendChild(li);
      });
    } catch (error) {
      console.error("Erro ao listar técnicas:", error);
      listaTecnicas.innerHTML =
        '<p class="text-red-600">Erro ao carregar as técnicas cadastradas. Tente novamente mais tarde.</p>';
    }
  }

  // Função para cadastrar técnica
  formTecnica.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    if (!nome) {
      alert("O nome da técnica é obrigatório.");
      return;
    }

    try {
      const res = await fetch(`https://${ipServer}:3000/tecnicas_utilizadas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, psicologo_id: psicologoId }),
      });

      if (!res.ok) throw new Error("Erro ao cadastrar técnica.");
      alert("Técnica cadastrada com sucesso!");
      formTecnica.reset();
      listarTecnicas(); // Atualizar a lista de técnicas
    } catch (error) {
      console.error("Erro ao cadastrar técnica:", error);
      alert("Erro ao cadastrar a técnica. Tente novamente.");
    }
  });

  // Função para excluir técnica
  window.excluirTecnica = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta técnica?")) return;

    try {
      const res = await fetch(
        `https://${ipServer}:3000/tecnicas_utilizadas/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Erro ao excluir técnica.");
      alert("Técnica excluída com sucesso!");
      listarTecnicas(); // Atualizar a lista de técnicas
    } catch (error) {
      console.error("Erro ao excluir técnica:", error);
      alert("Erro ao excluir a técnica. Tente novamente.");
    }
  };

  // Inicializar
  listarTecnicas();
});
