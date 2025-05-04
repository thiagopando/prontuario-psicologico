document.addEventListener("DOMContentLoaded", () => {
  const ipServer = window.location.hostname;
  const psicologoId = localStorage.getItem("psicologoId");

  const form = document.getElementById("formPsicologo");
  const feedback = document.getElementById("feedback");

  if (!psicologoId) {
    alert("Usuário não autenticado. Faça login novamente.");
    window.location.href = "../index.html";
    return;
  } else carregarPsicologo();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value,
      crp: document.getElementById("crp").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      endereco: document.getElementById("endereco").value,
      validade_documentos: document.getElementById("validade_documentos").value,
    };

    const url = psicologoId
      ? `http://${ipServer}:3000/psicologos/${psicologoId}`
      : `http://${ipServer}:3000/psicologos`;
    const method = psicologoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!res.ok) throw new Error("Erro ao salvar dados.");

      feedback.textContent = "Dados salvos com sucesso!";
      feedback.className = "text-green-600";
      form.reset();
    } catch (error) {
      feedback.textContent = "Erro ao salvar dados.";
      feedback.className = "text-red-600";
      console.error(error);
    }
  });

  async function carregarPsicologo() {
    try {
      const res = await fetch(
        `http://${ipServer}:3000/psicologos/${psicologoId}`
      );
      if (!res.ok) throw new Error("Erro ao carregar psicólogo.");

      const p = await res.json();

      document.getElementById("nome").value = p.nome;
      document.getElementById("crp").value = p.crp;
      document.getElementById("email").value = p.email;
      document.getElementById("telefone").value = p.telefone;
      document.getElementById("endereco").value = p.endereco;
      document.getElementById("validade_documentos").value =
        p.validade_documentos;
    } catch (error) {
      console.error("Erro ao carregar dados do psicólogo:", error);
    }
  }
});
