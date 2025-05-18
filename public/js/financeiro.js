document.addEventListener("DOMContentLoaded", () => {
  const btnBuscar = document.getElementById("buscar");
  const lista = document.getElementById("listaSessoes");
  const totalSessoes = document.getElementById("totalSessoes");
  const totalPagas = document.getElementById("totalPagas");
  const totalPendentes = document.getElementById("totalPendentes");
  const selectPaciente = document.getElementById("paciente");

  const ip = window.location.hostname;
  const protocolo = window.location.protocol;
  const psicologoId = localStorage.getItem("psicologoId");

  // Carrega os pacientes no select
  async function carregarPacientes() {
    if (!psicologoId) return;

    try {
      const res = await fetch(
        `${protocolo}//${ip}:3000/pacientesRoutes/psicologo/${psicologoId}`
      );
      const pacientes = await res.json();

      pacientes.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.nome;
        selectPaciente.appendChild(option);
      });
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
      alert("Erro ao carregar a lista de pacientes.");
    }
  }

  carregarPacientes();

  btnBuscar.addEventListener("click", async () => {
    const mesSelecionado = document.getElementById("mes").value;
    const pacienteId = selectPaciente.value;

    if (!mesSelecionado || !psicologoId) {
      alert("Selecione um mês e esteja logado.");
      return;
    }

    const [ano, mes] = mesSelecionado.split("-");
    let url = `${protocolo}//${ip}:3000/financeiro/sessoes/${psicologoId}/${ano}/${mes}`;

    if (pacienteId) {
      url += `?paciente_id=${pacienteId}`;
    }

    try {
      const res = await fetch(url);
      const sessoes = await res.json();

      lista.innerHTML = "";
      let pagas = 0;
      let pendentes = 0;
      let totalRecebido = 0;
      let totalPendenteValor = 0;

      sessoes.forEach((s) => {
        const valor = parseFloat(s.valor_sessao || 0);
        const pago = s.status === "pago";

        if (pago) {
          pagas++;
          totalRecebido += valor;
        } else {
          pendentes++;
          totalPendenteValor += valor;
        }

        const btnNotaFiscal = document.getElementById("btnNotaFiscal");

        if (pagas > 0) {
          btnNotaFiscal.classList.remove("hidden");
        } else {
          btnNotaFiscal.classList.add("hidden");
        }

        btnNotaFiscal.onclick = () => {
          const pacienteId = document.getElementById("paciente").value;
          const mesSelecionado = document.getElementById("mes").value;

          if (!pacienteId) {
            alert("Selecione um paciente específico para gerar a Nota Fiscal.");
            return;
          }

          localStorage.setItem("notaPacienteId", pacienteId);
          localStorage.setItem("notaMesSelecionado", mesSelecionado);

          window.location.href = "nota_fiscal.html";
        };

        const item = document.createElement("div");
        item.className = "bg-white p-3 rounded shadow";

        item.innerHTML = `
    <div class="flex justify-between items-center">
      <div>
        <p><strong>Paciente:</strong> ${s.nome_paciente}</p>
        <p><strong>Data:</strong> ${new Date(s.data).toLocaleDateString(
          "pt-BR"
        )}</p>
        <p><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>
      </div>
      <div class="text-right">
        <p class="${pago ? "text-green-600" : "text-red-600"} mb-2">
          ${pago ? "✅ Pago" : "❌ Pendente"}
        </p>
        ${
          !pago
            ? `<button 
                 class="bg-primary text-white px-3 py-1 rounded hover:bg-blue-500"
                 onclick="marcarComoPaga(${s.id})"
               >
                 Marcar como paga
               </button>`
            : ""
        }
      </div>
    </div>
  `;

        lista.appendChild(item);
      });

      totalSessoes.textContent = sessoes.length;
      totalPagas.textContent = `R$ ${totalRecebido.toFixed(2)}`;
      totalPendentes.textContent = `R$ ${totalPendenteValor.toFixed(2)}`;
    } catch (err) {
      console.error("Erro ao buscar sessões:", err);
      alert("Erro ao buscar sessões.");
    }
  });
});

window.marcarComoPaga = async function (sessaoId) {
  const confirmacao = confirm("Deseja marcar esta sessão como paga?");
  if (!confirmacao) return;

  const ip = window.location.hostname;
  const protocolo = window.location.protocol;

  try {
    const res = await fetch(
      `${protocolo}//${ip}:3000/financeiro/sessao/${sessaoId}/pagar`,
      {
        method: "PUT",
      }
    );

    if (!res.ok) throw new Error("Erro ao atualizar status da sessão.");

    alert("Sessão marcada como paga.");
    document.getElementById("buscar").click(); // Recarrega lista
  } catch (err) {
    console.error("Erro ao marcar como paga:", err);
    alert("Erro ao marcar sessão como paga.");
  }
};
