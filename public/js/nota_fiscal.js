document.addEventListener("DOMContentLoaded", () => {
  const selectPaciente = document.getElementById("paciente");
  const inputMes = document.getElementById("mes");
  const btnGerarRps = document.getElementById("btnGerarRps");
  const btnGerarLote = document.getElementById("btnGerarLote");
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
      if (!res.ok) throw new Error("Erro ao carregar pacientes.");

      const pacientes = await res.json();

      if (pacientes.length === 0) {
        selectPaciente.innerHTML =
          "<option disabled>Nenhum paciente encontrado</option>";
        return;
      }

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
      selectPaciente.innerHTML =
        "<option disabled>Erro ao carregar pacientes</option>";
    }
  }

  carregarPacientes();

  if (notaMesSelecionado) {
    inputMes.value = notaMesSelecionado;
  }

  // Evento para gerar RPS de uma única sessão
  btnGerarRps.addEventListener("click", async () => {
    const sessaoId = prompt("Digite o ID da sessão paga:");
    if (!sessaoId) {
      alert("O ID da sessão é obrigatório.");
      return;
    }

    try {
      resultadoXml.textContent = "Gerando XML...";

      const res = await fetch(
        `${protocolo}//${ip}:3000/nota-fiscal/gerar-rps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessaoId }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        resultadoXml.textContent = `❌ Erro: ${
          error.error || "Falha ao gerar o RPS."
        }`;
        return;
      }

      const xml = await res.text();
      resultadoXml.textContent = xml;
    } catch (err) {
      console.error("Erro ao gerar RPS:", err);
      resultadoXml.textContent = "❌ Ocorreu um erro ao gerar o RPS.";
    }
  });

  // Evento para gerar lote de RPS
  btnGerarLote.addEventListener("click", async () => {
    const pacienteId = selectPaciente.value;
    const mesSelecionado = inputMes.value;

    if (!pacienteId || !mesSelecionado) {
      alert("Selecione o mês e o paciente.");
      return;
    }

    const [ano, mes] = mesSelecionado.split("-");

    try {
      resultadoXml.textContent = "Gerando XML...";

      const res = await fetch(
        `${protocolo}//${ip}:3000/nota-fiscal/gerar-lote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pacienteId, ano, mes }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        resultadoXml.textContent = `❌ Erro: ${
          error.error || "Falha ao gerar o lote de RPS."
        }`;
        return;
      }

      const xml = await res.text();
      resultadoXml.textContent = xml;
    } catch (err) {
      console.error("Erro ao gerar lote de RPS:", err);
      resultadoXml.textContent = "❌ Ocorreu um erro ao gerar o lote de RPS.";
    }
  });

  async function carregarDadosFiscais() {
    try {
      const res = await fetch(
        `${protocolo}//${ip}:3000/psicologoRoutes/${psicologoId}`
      );
      if (!res.ok) throw new Error("Erro ao buscar dados do psicólogo.");
      const p = await res.json();

      document.getElementById("fiscal_nome").textContent =
        p.razao_social || p.nome || "-";
      document.getElementById("fiscal_cpf_cnpj").textContent =
        p.cpf_cnpj || "-";
      document.getElementById("fiscal_im").textContent =
        p.inscricao_municipal || "-";
      document.getElementById("fiscal_endereco").textContent = `${
        p.endereco_rua || ""
      }, ${p.endereco_numero || ""} - ${p.endereco_cidade || ""} / ${
        p.endereco_estado || ""
      }`;
      document.getElementById("fiscal_regime").textContent = traduzirRegime(
        p.regime_tributario
      );
      document.getElementById("fiscal_servico").textContent =
        p.codigo_servico || "801";
    } catch (err) {
      console.error("Erro ao carregar dados fiscais:", err);
    }
  }

  function traduzirRegime(valor) {
    switch (valor) {
      case "1":
        return "MEI";
      case "2":
        return "Simples Nacional";
      case "3":
        return "Lucro Presumido";
      default:
        return "-";
    }
  }
  carregarDadosFiscais();
});
