const listaPacientes = document.getElementById("listaPacientes");

async function listarPacientes() {
  const ipServer = window.location.hostname;
  const psicologoId = localStorage.getItem("psicologoId");

  if (!psicologoId) {
    alert("Usuário não autenticado. Faça login novamente.");
    window.location.href = "../index.html";
    return;
  }

  try {
    const res = await fetch(
      `http://${ipServer}:3000/pacientes/psicologo/${psicologoId}`
    );

    if (!res.ok) {
      throw new Error("Erro na requisição: " + res.status);
    }

    const pacientes = await res.json();

    listaPacientes.innerHTML = "";

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      listaPacientes.innerHTML =
        '<p class="text-gray-600">Nenhum paciente cadastrado ainda.</p>';
      return;
    }

    pacientes.forEach((p) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <button onclick="window.location.href='paciente.html?id=${p.id}'"
            class="flex items-center justify-between w-full bg-white shadow-md hover:shadow-lg p-4 rounded-lg border border-gray-200 transition duration-200">
            
            <div class="flex items-center">
                <lord-icon
                    src="https://cdn.lordicon.com/czeaidmx.json"
                    trigger="hover"
                    style="width:40px;height:40px">
                </lord-icon>
                <span class="ml-4 text-lg font-medium text-dark">${p.nome}</span>
            </div>
            
            <span class="text-primary text-lg">Ver detalhes</span>
        </button>
      `;
      listaPacientes.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);
    listaPacientes.innerHTML =
      '<p class="text-red-600">Erro ao carregar pacientes.</p>';
  }
}

document.addEventListener("DOMContentLoaded", listarPacientes);
