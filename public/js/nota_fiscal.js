document.addEventListener("DOMContentLoaded", () => {
  const selectPaciente = document.getElementById("paciente");
  const inputMes = document.getElementById("mes");
  const btnEmitir = document.getElementById("emitir");
  const resultadoXml = document.getElementById("resultadoXml");
  const ip = window.location.hostname;
  const protocolo = window.location.protocol;
  const psicologoId = localStorage.getItem("psicologoId");

  const notaPacienteId = localStorage.getItem("notaPacienteId");
  const notaMesSelecionado = localStorage.getItem("notaMesSelecionado");

  async function carregarPacientes() {
    try {
      const res = await fetch(
        `${protocolo}//${ip}:3000/pacientesRoutes/psicologo/${psicologoId}`
      );
      const pacientes = await res.json();

      pacientes.forEach((p) => {
        if (!notaPacienteId || p.id == notaPacienteId) {
          const option = document.createElement("option");
          option.value = p.id;
          option.textContent = p.nome;
          selectPaciente.appendChild(option);
        }
      });

      if (notaPacienteId) {
        selectPaciente.value = notaPacienteId;
        selectPaciente.disabled = true;
      }
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
      alert("Erro ao carregar pacientes.");
    }
  }

  carregarPacientes();

  if (notaMesSelecionado) {
    inputMes.value = notaMesSelecionado;
  }

  btnEmitir.addEventListener("click", async () => {
    const pacienteId = selectPaciente.value;
    const mesSelecionado = inputMes.value;

    if (!pacienteId || !mesSelecionado) {
      alert("Selecione o mês e o paciente.");
      return;
    }

    const [ano, mes] = mesSelecionado.split("-");

    try {
      const res = await fetch(`${protocolo}//${ip}:3000/nota-fiscal/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, ano, mes }),
      });

      if (res.status === 404) {
        resultadoXml.textContent =
          "⚠️ Nenhuma sessão paga encontrada para esse período.";
        return;
      }

      const xml = await res.text();
      resultadoXml.textContent = xml;
    } catch (err) {
      console.error("Erro ao emitir nota:", err);
      alert("Erro ao emitir a nota fiscal.");
    }
  });
});
